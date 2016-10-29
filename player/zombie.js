"use strict";

var Walker = require('./walker.js');
var Utils = require('./../utils.js');

var ZombieState = require('./ZombieState');
var ZombieInput = require('./ZombieInput');
var PlayerBuffs = require('./PlayerBuffs');


function Zombie(chamber, type, clientId) {
    this.chamber = chamber;
    this.clientId = clientId;
    this.zombieType = type;

    this.input = new ZombieInput(this);
    this.buffs = new PlayerBuffs(this);
    this.buffs.stats.movementSpeed = 100;

    var position = {
        x: 64,
        y: 64,
    };
    Walker.call(this, this.chamber.game, this.chamber, position);

    this.zombieState = new ZombieState(this);

    this.path = [];
    this.pathIsNew = false;
    this.target = undefined;

    // Sensible defaults
    this.width = 30;
    this.height = 30;
// Original:
//    this.width = 34;
//    this.height = 36;

    this.selectNextTargetInterval = 2000;
    this.calculatePathInterval = 1000;

    this.exists = false;
    this.left = true;
}
Zombie.prototype = Object.create(Walker.prototype);
Zombie.prototype.constructor = Zombie;

module.exports = Zombie;



/* calculate new path for this zombie
 *
 * Calculates a path from current position/tile of the zombie
 * to the selected target player this.target
 * and stores the path in this.path (and set this.pathIsNew=true)
 *
 * This gets called on regular basis, but not on every tick.
 */
Zombie.prototype.calcPath = function() {
    if (this.target == undefined) {
        return;
    }
    var enemyTile = this.target.getCurrentTile();
    var tile = this.getCurrentTile();

    this.chamber.easystar.findPath(
        tile.x, tile.y,
        enemyTile.x, enemyTile.y,
        function( path )
        {
            if (path === null) {
                console.log("Path was not found.");
            } else {
                this.path = path;
                this.pathIsNew = true;
                //printEasy(path);
            }
        }.bind(this)
    );
}



/* Spawn zombie at the given location 'position'
 *
 * Immediatly starts selecting the target and to calculate a path
 * to the target.
 */
Zombie.prototype.spawn = function(position) {
    this.position.x = position.x;
    this.position.y = position.y;
    this.exists = true;

    this.nextTargetSelectTime = Utils.getCurrentTime() + 1000;
    this.nextCalculatePathTime = Utils.getCurrentTime() + 1200;

    this.selectNextTarget();
    this.calcPath();
}



Zombie.prototype.getForNetwork = function() {
    var p = {
        position: this.getPosition(),
        clientId: this.clientId,
        characterSkinIndex: 1,
        zombieType: this.zombieType,
        state: this.zombieState.getForNetwork(),
        input: this.input.getForNetwork(),
    };
    return p;
}



Zombie.prototype.removeMe = function() {
    this.exists = false;
}



/* main update function
 *
 * Called by update loop
 *
 * Moves the zombie (according to the current direction)
 * And tries to update direction based on path, if necessary
 *
 */
Zombie.prototype.update = function(timeDiff, currentTime) {
    this.input.updatePosition(timeDiff);
    this.checkMovement(timeDiff, currentTime);
}



/* Move zombie to the next waypoint
 *
 * We have detected that the zombie arrived at the previous waypoint.
 * Takes current path to take next waypoint, and sets direction accordingly.
 *
 * Direction is based on current position, and the middle of the next
 * waypoint (tile).
 *
 * Expects: this.path[0] is the next waypoint
 * Result: calls into this.input to set new direction
 */
Zombie.prototype.moveToNextWp = function() {
    var nextPathTargetTile = this.path[0];
    var nextPathTargetPixel = {
        x: ((nextPathTargetTile.x * 32) + 16),
        y: ((nextPathTargetTile.y * 32) + 16)
    };
    var currentZombieTile = this.getCurrentTile();
    //var currentZombiePosition = this.getPosition();
    //console.log("Going to the next wp: " + nextPathTargetTile.x + " / " + nextPathTargetTile.y);

    var diffX = currentZombieTile.x - nextPathTargetTile.x;
    var diffY = currentZombieTile.y - nextPathTargetTile.y;

    if (diffX < 0) {
        //console.log("Move: Right");
        this.input.moveDirection('right');
    } else if (diffX > 0) {
        //console.log("Move: Left");
        this.input.moveDirection('left');
    }

    if (diffY > 0) {
        //console.log("Move: Up");
        this.input.moveDirection('up');
    } else if (diffY < 0) {
        //console.log("Move: Down");
        this.input.moveDirection('down');
    }
}



/* Checks if zombie arrived at the current waypoint
 *
 * Returns true if it arrived at the current waypoint, or false else.
 *
 * This has some trickery: It checks not if the zombie arrived at center
 * of tile, but a bit further (based on the direction).
 * This should ensure that the zombie is really moving enough to not clip
 * the map, and get stuck.
 *
 */
Zombie.prototype.arrivedAtWp = function() {
    var nextPathTargetTile = this.path[0];

    var nextPathTargetPixel = {
        x: ((nextPathTargetTile.x * 32) + 16),
        y: ((nextPathTargetTile.y * 32) + 16)
    };
    //var currentZombieTile = this.getCurrentTile();
    var currentZombiePosition = this.getPosition();

    // Magic destination adjustment, based on current direction.
    if (this.input.keys.left == 1) {
        nextPathTargetPixel.x -= 6;
    }
    if (this.input.keys.right == 1) {
        nextPathTargetPixel.x += 6;
    }
    if (this.input.keys.up == 1) {
        nextPathTargetPixel.y -= 6;
    }
    if (this.input.keys.down == 1) {
        nextPathTargetPixel.y += 6;
    }

    // Calculate distance
    var diffX = Math.abs(currentZombiePosition.x - nextPathTargetPixel.x);
    var diffY = Math.abs(currentZombiePosition.y - nextPathTargetPixel.y);

    // Only return true if the distance is small enough
    if (diffX < 6 && diffY < 6) {
        return true;
    } else {
        return false;
    }
}



/* Select next target to follow for this zombie
 *
 * Asks the chamber to get the closest player to this zombie.
 * If no player exists, it will be undefined.
 *
 */
Zombie.prototype.selectNextTarget = function() {
    this.target = this.chamber.getClosestPlayerToZombie(this);
}



/* check movement of the zombie
 *
 * Called by the main update() loop on each tickrate.
 *
 * Will do periodically:
 * - select new target
 * - update path to target
 *
 */
Zombie.prototype.checkMovement = function(timeDiff, currentTime) {
    // SelectNextTarget() timer
    if (currentTime > this.nextTargetSelectTime) {
        this.nextTargetSelectTime = currentTime + this.selectNextTargetInterval;
        this.selectNextTarget();
    }
    // CalculatePath() timer
    if (currentTime > this.nextCalculatePathTime) {
        this.nextCalculatePathTime = currentTime + this.calculatePathInterval;
        this.calcPath();
    }

    // No path, bail out
    if (this.path.length == 0) {
        return;
    }

    var nextPathTargetTile = this.path[0];
    var nextPathTargetPixel = {
        x: ((nextPathTargetTile.x * 32) + 16),
        y: ((nextPathTargetTile.y * 32) + 16)
    };
    var currentZombieTile = this.getCurrentTile();
    var currentZombiePosition = this.getPosition();


    if (this.pathIsNew) {
        // If its new, the most current waypoint is the waypoint the zombie
        // currently is. Discard it, and move to the first real one.
        this.pathIsNew = false;
        this.path.splice(0, 1);
        this.moveToNextWp();
        return;
    } else {
        // Check if we are on the same tile as the waypoint
        // if not, we are still moving to the target tile, and dont have to do
        // anything
        if (! (nextPathTargetTile.x == currentZombieTile.x
            && nextPathTargetTile.y == currentZombieTile.y) )
        {
            return;
        }
    }

    // If we arrive here, the zombie is at the same tile as the next
    // waypoint.

    // Check if we arrived really at the waypoint. We can be at the same
    // Tile, but that does not mean we arrived in the 'middle' of the tile.
    if (this.arrivedAtWp()) {
        // did i arrive at the really last wp?
        // if yes, stop movement.
        if (this.path.length == 1) {
            this.path = [];
            this.input.cancelMovement();
            return;
        }

        //console.log("I arrived at wp. Make new direction");

        // we arrived at the waypoint. Move to the next one.
        this.path.splice(0, 1);
        this.moveToNextWp();
    }
}



Zombie.prototype.handleCollisionBulletHit = function(sourcePlayer) {
    this.zombieState.handleBulletHit(sourcePlayer);
}



Zombie.prototype.handleCollisionGrenadeHit = function(sourcePlayer) {
    this.zombieState.handleGrenadeHit(sourcePlayer);
}



function printEasystarPath(path) {
    for(var n=0; n<path.length; n++) {
        console.log(" The " + n  + " Point is " + path[n].x + " " + path[n].y);
    }
}
