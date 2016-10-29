"use strict";

var Player = require('./../player/player.js');
var Pharcade = require('./../phaser/Pharcade.js')
var Map = require('./map.js');
var Utils = require('./../utils.js');
var ChamberStats = require('./ChamberStats.js');
var PowerupGroup = require('./powerup/PowerupGroup.js');
var ZombieGroup = require('./../player/ZombieGroup.js');
var winston = require('winston');
var EasyStar = require('easystarjs');

/* Chamber.js
 *
 * - has a physics world (this.game)
 * - has players of this chamber
 *   - creates and removes  players
 * - has an update loop (called from game-server)
 * - handles collisions of this chamber (world)
 *
 * Physics groups:
 * - mapGroup: unwalkable map tiles
 * - playerGroup: all players of the chamber
 */
function Chamber(chamberName, mongoDB) {
    this.chamberName = chamberName;
    this.mongoDB = mongoDB;

    this.network = undefined; // gets set later
    this.chamberStats = new ChamberStats();

    this.timers = {
        nextUpdateStatsTime: 0,
        nextPingTime: 0,
    };

    winston.info("Loading up chamber: " + chamberName)

    this.game = new Pharcade.FakeGame(2048, 2048);
    // Possible clipping/tunneling fixes
    //this.game.physics.arcade.TILE_BIAS = 60;
    //this.game.physics.arcade.OVERLAP_BIAS = 10;

    // Create player group
    this.playerGroup = new Pharcade.Group(this.game, null, "playerGroup", true, true);

    // Load the map into mapGroup
    this.mapGroup = new Pharcade.Group(this.game, null, "mapGroup", true, true);
    this.map = new Map(this.game);
    this.map.parseMap(this.mapGroup, 'level2');

    // Load path finding module
    this.easystar = new EasyStar.js();
    this.easystar.setGrid(this.map.mapEntitiesArr2);
    this.easystar.setAcceptableTiles([0]);

    // Dynamic entities
    this.powerupGroup = new PowerupGroup(this, this.map);
    this.powerupGroup.startMapInit();

    // and some zombies
    this.zombieGroup = new ZombieGroup(this, this.map);
    this.zombieGroup.startMapInit();
}
Chamber.prototype.constructor = Chamber;

module.exports = {
    Chamber: Chamber
}



/* Update
 *
 * The chamber's main update loop
 *
 * - update player and other entities position
 * - collision with map
 * - collision detection
 *
 */
Chamber.prototype.updateLoop = function(timeDiff, currentTime) {
    this.chamberStats.addServerSleepTime(timeDiff);
    var isActive = false;

    // Set elapsed time for physics engine
    this.game.setElapsedTime(timeDiff);

    this.easystar.calculate();

    // advance physics
    this.game.preUpdate();


    // Update all positions of players and their bullets
    this.playerGroup.forEachExists(function(player) {
        player.update(timeDiff, currentTime);
        isActive = true;
    }, this);

    // and zombies
    this.zombieGroup.forEachExists(function(zombie) {
        zombie.update(timeDiff, currentTime);
    }, this);


    // Collision: Player with map
    this.game.physics.arcade.collide(this.playerGroup, this.mapGroup);

    // Collision: Zombies with map
    this.game.physics.arcade.collide(this.zombieGroup, this.mapGroup);


    this.playerGroup.forEachExists(function(player) {
        // Collision: player with players barriers
        this.game.physics.arcade.collide(this.playerGroup, player.weaponBarrier);

        // Collision: zombies with players barriers
        this.game.physics.arcade.collide(this.zombieGroup, player.weaponBarrier);
    }, this);


    // Postupdate
    this.game.postUpdate();

    // And collision detection
    this.playerGroup.forEachExists(function(player) {

        // CD: all-players with player-bullets
        this.game.physics.arcade.overlap(
            this.playerGroup,
            player.weaponBullet,
            this.handleBulletHitPlayerCollision,
            null,
            this);

        // CD: all-zombies with player-bullets
        this.game.physics.arcade.overlap(
            this.zombieGroup,
            player.weaponBullet,
            this.handleBulletHitZombieCollision,
            null,
            this);


        // CD: all-players with player-grenades
        this.game.physics.arcade.overlap(
            this.playerGroup,
            player.weaponGrenade,
            this.handleGrenadeHitPlayerCollision,
            null,
            this);


        // CD: zombies with player-grenades
        this.game.physics.arcade.overlap(
            this.zombieGroup,
            player.weaponGrenade,
            this.handleGrenadeHitZombieCollision,
            null,
            this);


        // CD: player-bullets with map
        this.game.physics.arcade.overlap(
            this.mapGroup,
            player.weaponBullet,
            this.handleBulletHitWallCollision,
            null,
            this);

        this.playerGroup.forEachExists(function(player2) {
            // CD: player-bullets with player-barriers
            this.game.physics.arcade.overlap(
                player.weaponBarrier,
                player2.weaponBullet,
                this.handleBulletHitWallCollision,
                null,
                this);
        }, this);



    }, this);

    // CD: all zombies with all players
    this.game.physics.arcade.overlap(
        this.playerGroup,
        this.zombieGroup,
        this.handlePlayerHitByZombieCollision,
        null,
        this);

    // CD: player with powerups
    this.game.physics.arcade.overlap(
        this.playerGroup,
        this.powerupGroup,
        this.handlePlayerHitPowerupCollision,
        null,
        this);

    // periodically send updates
    this.netSendServerStats(currentTime);
    this.netSendPing(currentTime);

    // And debug me maybe
	this.myDebug(currentTime);

    return isActive;
}



Chamber.prototype.handleGrenadeHitZombieCollision = function(zombie, playerSprite) {
    // Send collision notification event
    // Positino is atm the player position (not the collision point)
    var pos = zombie.getPosition();
    this.netSendCollisionEvent(pos);

    // Update player stats
    zombie.handleCollisionGrenadeHit(playerSprite);
}



Chamber.prototype.handlePlayerHitByZombieCollision = function(playerSprite, zombie) {
    // Send collision notification event
    // Positino is atm the player position (not the collision point)
    var pos = playerSprite.getPosition();
    this.netSendCollisionEvent(pos);

    // Update player stats
    playerSprite.handleCollisionZombieHit(zombie);
}


Chamber.prototype.handlePlayerHitPowerupCollision = function(playerSprite, powerupSprite) {
    // Apply and send update
    playerSprite.applyPowerup(powerupSprite.powerupType);

    // Remove and send update
    powerupSprite.removeMe();
    var removeEntityEvent = {
        type: 'powerup',
        uniqueId: powerupSprite.uniqueId,
    }
    this.network.sendRemoveEntityEvent(removeEntityEvent);

    // And also: create new and send update
    var newPowerup = this.powerupGroup.spawnNew();
    var addEntityEvent = {
        type: 'powerup',
        powerup: newPowerup.getForNetwork(),
    }
    this.network.sendAddEntityEvent(addEntityEvent);
}



/* handleBulletHitWallCollision
 *
 * Called when a bullet hits a wall
 * Remove the bullet
 * Notify all players that the bullet has been removed
 */
Chamber.prototype.handleBulletHitWallCollision = function(mapSprite, bulletSprite) {
    // send remove event to all players
    var removeEntityEvent = {
        clientId: bulletSprite.parentWeapon.parentPlayer.clientId,
        itemId: bulletSprite.index,
        type: 'bullet',
    }
    //this.network.sendRemoveEntityEvent(removeEntityEvent);

    // And deactivate it
    bulletSprite.deactivateMe();
}



/* HandleGrenadeHitPlayerCollision
 *
 * Called when a grenade hits a player
 */
Chamber.prototype.handleGrenadeHitPlayerCollision = function(playerSprite, bulletSprite) {
    // Send event
    // Position is atm the player position (not the collision point)
    var pos = playerSprite.getPosition();
    this.netSendCollisionEvent(pos);

    // Update player stats
    playerSprite.handleCollisionGrenadeHit(bulletSprite.player);

    // Send new stats to all players
    this.network.sendPlayerStatsUpdate(playerSprite.playerState.getForNetwork());
}



/* HandleBulletHitPlayerCollision
 *
 * Called when a bullet hits a player
 */
Chamber.prototype.handleBulletHitPlayerCollision = function(playerSprite, bulletSprite) {
    // Dont care if player hits himself (happens upon spawn of bullet)
    if (playerSprite == bulletSprite.player) {
        return;
    }

    // Send collision notification event
    // Positino is atm the player position (not the collision point)
    var pos = playerSprite.getPosition();
    this.netSendCollisionEvent(pos);

    // Update player stats
    playerSprite.handleCollisionBulletHit(bulletSprite.player);


    // Remove bullet from world (so it does not pierce)
    bulletSprite.deactivateMe();
}


/* HandleBulletHitPlayerCollision
 *
 * Called when a bullet hits a player
 */
Chamber.prototype.handleBulletHitZombieCollision = function(zombieSprite, bulletSprite) {
    // Send collision notification event
    // Positino is atm the player position (not the collision point)
    var pos = zombieSprite.getPosition();
    this.netSendCollisionEvent(pos);

    // Update player stats
    zombieSprite.handleCollisionBulletHit(bulletSprite.player);


    // Remove bullet from world (so it does not pierce)
    bulletSprite.deactivateMe();
}





/* netSendCollisionEvent
 *
 * a collision happened at position pos.
 * Send it to all players of this chamber.
 */
Chamber.prototype.netSendCollisionEvent = function(pos) {
    var collisionEvent = {
        'type': 'collisionEvent',
        'data': {
            'affected': 'player',
            'affectedClientId': '',
            'reason': 'bullet',
            'position': pos
        }
    }

    this.network.wss.broadcast(collisionEvent);
}



/* setNetwork
 *
 * Called from game server.
 * Set network so we can send messages.
 */
Chamber.prototype.setNetwork = function(network) {
    this.network = network;
}



/* netSendServerStats
 *
 * Send current server stats to all players.
 */
Chamber.prototype.netSendServerStats = function(currentTime) {
    if (currentTime < this.timers.nextUpdateStatsTime) {
        return;
    }

    this.network.sendChamberStats( this.chamberStats.getStats() );
    this.timers.nextUpdateStatsTime = currentTime + 2000;
}

Chamber.prototype.netSendPing= function(currentTime) {
    if (currentTime < this.timers.nextPingTime) {
        return;
    }

    this.playerGroup.forEachExists(function(player) {
        player.netSendPing();
    }, this);

    this.timers.nextPingTime = currentTime + 2000;
}



/* myDebug
 *
 * Print debug stuff on the console
 */
Chamber.prototype.myDebug = function(currentTime) {
	if (currentTime - this.debugTime < 10000) {
		return;
	}
/*
    for(var clientId in this.players) {
        console.log("Player: " + clientId + ": "
            + this.players[clientId].position.x
            + " / "
            + this.players[clientId].position.y
        );
    }
    */

	this.debugTime = currentTime;
}



/* GetAllPlayersAsArrayExcept
 *
 * Used for networking
 *
 */
Chamber.prototype.getAllPlayersAsArrayNetworkExcept = function(clientId) {
    var players = [];

    this.playerGroup.forEach(function(player) {
        if (player.clientId != clientId) {
            players.push( player.getForNetwork() );
        }
    }, this);

    return players;
}



/* getName
 *
 * Returns the name of this chamber
 */
Chamber.prototype.getName = function() {
    return this.chamberName;
}


Chamber.prototype.getForWeb = function() {
    var c = {
        name: this.chamberName,
        players: this.getPlayersWeb(),
        stats: this.chamberStats.getStats(),
    }
    return c;
}



Chamber.prototype.getPlayersWeb = function() {
    var p = [];
    this.playerGroup.forEach(function (player) {
        p.push( player.getForWeb() );
    }, this);
    return p;
}



Chamber.prototype.getRandomPlayer = function() {
    return this.playerGroup.getFirstExists(true);
}



Chamber.prototype.getClosestPlayerToZombie = function(zombie) {
    var closestPlayer = undefined;
    var minDistance = 100000;

    this.playerGroup.forEach(function (player) {
        if (player.playerState.isAlive()) {
            var distance = this.game.physics.arcade.distanceBetween(zombie, player);
            if (distance < minDistance) {
                closestPlayer = player;
                minDistance = distance;
            }
        }
    }, this);

    return closestPlayer;
}



/* createPlayer
 *
 * Creates a new player which is connected
 * called on registerClient() from network
 *
 */
Chamber.prototype.createPlayer = function(userName, clientId, ws) {
    var position = this.map.generateRandomWalkableCoordinates();

    var player = new Player.Player(
        this.game,
        this,
        position,
        userName,
        clientId,
        ws);

    winston.info('Chamber: New player: ' + userName + ' (' + clientId + ')');
    this.playerGroup.add(player);
    winston.info('Chamber: Number of players: ' + this.playerGroup.length);

    this.addPlayerEventToDb(userName, clientId, "Login");

    return player;
}



/* removePlayer
 *
 * Removes a player from the game
 * - removes sprite
 * - removes player object
 */
Chamber.prototype.removePlayer = function(player) {
    this.addPlayerEventToDb(player.userName, player.clientId, "Logout");

    winston.info('Chamber: Remove player: ' + player.userName +' (' + player.clientId + ')');
    this.playerGroup.remove(player);
    winston.info('Chamber: Number of players: ' + this.playerGroup.length);

    player.destroy();
}



Chamber.prototype.addPlayerEventToDb = function(userName, clientId, event) {
    var mongoData = {
        dateJoined: new Date(),
        userName: userName,
        clientID: clientId,
        event: event,
    };

    var mongoCollectionPlayers = this.mongoDB.collection('players');
    mongoCollectionPlayers.insertOne(mongoData, function (err, result) {
        if (err) {
            console.log(err);
        } else {
        }
    });

}
