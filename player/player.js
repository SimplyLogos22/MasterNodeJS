"use strict";

var Utils = require('./../utils.js');
var winston = require('winston');
var Pharcade = require('./../phaser/Pharcade.js')
var Walker = require('./walker.js')
var PlayerInput = require('./playerInput.js');

var Buff = require('./buffs/buffs.js');
var BulletWeapon = require('./weapons/bulletWeapon.js');
var GrenadeWeapon = require('./weapons/grenadeWeapon.js');
var BarrierWeapon = require('./weapons/barrierWeapon.js');

var PlayerStatistics = require('./PlayerStatistics');
var PlayerState = require('./PlayerState');
var PlayerBuffs = require('./PlayerBuffs');


/* Player.js
 *
 * The server impersonation of the client/player.
 *
 * - contains all player related data
 *   - for physics (position etc)
 *   - for gameplay (health etc, in this.playerState)
 * - handles client input (key presses etc)  from network to update
 *     player (location etc) in world
 * - tracks player statistics
 */
function Player(game, chamber, position, userName, clientId, ws) {
	this.game = game;
    this.chamber = chamber;
	this.clientId = clientId;
	this.userName = userName;
    this.ws = ws;

    Walker.call(this, this.chamber.game, this.chamber, position);

	// Sensible defaults
	this.width = 32;
	this.height = 36;

    this.playerBuffs = new PlayerBuffs(this);
    this.playerState = new PlayerState(this);
    this.playerStatistics = new PlayerStatistics(this);

	// weapons
	this.weaponBullet = new BulletWeapon(this.chamber, this);
    this.weaponGrenade = new GrenadeWeapon(this.chamber, this);
    this.weaponBarrier = new BarrierWeapon(this.chamber, this);

    // Buffs
    this.buffMovementSpeed = new Buff.MovementSpeed(game, this);
    this.buffAttackSpeed = new Buff.AttackSpeed(game, this);
    this.buffInvisibility = new Buff.Invisibility(game, this);
    this.buffShield = new Buff.Shield(game, this);

    // player input
    this.playerInput = new PlayerInput(this);

    // For client: skin
    this.characterSkinIndex = Utils.randomIntFromInterval(0, 11);

    this.pingId = 0;
    this.pingSendTime = 0;
    this.nextPingTime = Utils.getCurrentTime() + 1000;
}
Player.prototype = Object.create(Walker.prototype);
Player.prototype.constructor = Player;

module.exports = {
	Player: Player
};



/** Functions which change state of player **/


/* handleFireEvent
 *
 * Handle an incoming fireEvent from the client
 * Dispatch is to the correct weapon/buff
 */
Player.prototype.handleFireEvent = function(fireEventData) {
    // weapons
	if (fireEventData.weaponType == 'SingleBullet') {
		this.weaponBullet.fireNewBullet(fireEventData);
        this.playerStatistics.addBulletShot();
	} else if (fireEventData.weaponType == 'Barrier') {
        this.weaponBarrier.fireNewBullet(fireEventData);
        this.playerStatistics.addBarrierShot();
	} else if (fireEventData.weaponType == 'Grenade') {
        this.weaponGrenade.fireNewBullet(fireEventData);
        this.playerStatistics.addGrenadeShot();
	} // buffs
    else if (fireEventData.weaponType == 'MovementSpeed') {
        this.buffMovementSpeed.activate();
        this.playerStatistics.addMovementSpeed();
	} else if (fireEventData.weaponType == 'AttackSpeed') {
        this.buffAttackSpeed.activate();
        this.playerStatistics.addAttackSpeed();
	} else if (fireEventData.weaponType == 'Invisibility') {
        this.buffInvisibility.activate();
        this.playerStatistics.addInvisibility();
	} else if (fireEventData.weaponType == 'Shield') {
        this.buffShield.activate();
	}
}



/* handleCollisionBulletHit
 *
 * this player got hit from a bullet by player sourcePlayer.
 */
Player.prototype.handleCollisionBulletHit = function(sourcePlayer) {
    //winston.info("Player " + this.userName + " got hit by bullet from " + sourcePlayer.userName);
    this.playerState.handleBulletHit(sourcePlayer);
    this.playerStatistics.addBulletHit();
}



/* handleCollisionGrenadeHit
 *
 * this player got hit from a grenade by player sourcePlayer.
 */
Player.prototype.handleCollisionGrenadeHit = function(sourcePlayer) {
    //winston.info("Player " + this.userName + " got hit by grenade from " + sourcePlayer.userName);
    this.playerState.handleGrenadeHit(sourcePlayer);
    this.playerStatistics.addGrenadetHit();
}



Player.prototype.handleCollisionZombieHit = function(zombie) {
    //winston.info("Player " + this.userName + " got hit by zombie");
    this.playerState.handleZombieHit(zombie);
}



/* applyPowerup
 *
 * Called when the player overlaped a powerup
 * Will apply the powerup stats to this player
 * And notify all other players
 */
Player.prototype.applyPowerup = function(powerupType) {
    this.playerState.handlePowerup(powerupType);
    this.playerStatistics.addPowerup();
}


/** Ping **/

Player.prototype.netSendPing = function() {
    var data = {
        // No data atm
        id: this.pingId++,
    };
    this.pingSendTime = Utils.getCurrentTime();
    this.chamber.network.sendPing(this.ws, data);
}

Player.prototype.handlePong = function(data) {
    var pongReceiveTime = Utils.getCurrentTime();
    var latency = pongReceiveTime - this.pingSendTime;
    this.playerStatistics.addPing(latency);
}




/** Functions called by update loop **/

/* update
 *
 * Main update loop for the player
 * - updates position of player according to playerInput
 * - updates position of all player weapon ammo
 *
 * called by updateLoop(), after preUpdate(), before postUpdate() and collide()
 */
Player.prototype.update = function(timeDiff, currentTime) {
    this.weaponBullet.updateAllAmmo(timeDiff, currentTime);
    this.weaponGrenade.updateAllAmmo(timeDiff, currentTime);
    this.weaponBarrier.updateAllAmmo(timeDiff, currentTime);
    this.playerInput.updatePosition(timeDiff);

    this.pingTimer(currentTime);
}



Player.prototype.pingTimer = function(currentTime) {
    if (currentTime < this.nextPingTime) {
        return;
    }

    this.nextPingTime = currentTime + 1000;
    this.netSendPing();
}



/* getForNetwork
 *
 * get all data from player, in network compatible format (registerClient)
 *
 */
Player.prototype.getForNetwork = function() {
    var player = {
        'position': this.getPosition(),
        'userName': this.userName,
        'clientId': this.clientId,
        'characterSkinIndex': this.characterSkinIndex,
        'stats': this.playerBuffs.getForNetwork(),
        'state': this.playerState.getForNetwork(),
    }

    return player;
}



Player.prototype.getForWeb = function() {
    var player = this.getForNetwork();
    player.statistics = this.playerStatistics.getStatistics('all');

    return player;
}



Player.prototype.performDisconnect = function() {
    this.chamber.removePlayer(this);
}
