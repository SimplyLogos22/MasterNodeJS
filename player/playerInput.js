"use strict";

function PlayerInput(player) {
    this.player = player;

    // Keys
    this.lastMovementCommandX = 0;
    this.lastMovementCommandXTime = 0;
    this.lastMovementCommandY = 0;
    this.lastMovementCommandYTime = 0;
    this.keys = {
        'left': 0,
        'up': 0,
        'down': 0,
        'right': 0
    }
}
PlayerInput.prototype.constructor = PlayerInput;

module.exports = PlayerInput;


/** Handle keys **/

/* handleKeyPress
 *
 * handle the key presses by the clients
 * - update position (sent also by the client)
 * - set new direction
 */
PlayerInput.prototype.handleKeyPress = function(keys) {
    if (keys.key == 'left') {
        this.lastMovementCommandX = (-1)* this.player.playerBuffs.stats.movementSpeed;
        this.lastMovementCommandXTime = keys.time;
        this.keys.left = 1;
    }
    if (keys.key == 'right') {
        this.lastMovementCommandX = this.player.playerBuffs.stats.movementSpeed;
        this.lastMovementCommandXTime = keys.time;
        this.keys.right = 1;
    }

    if (keys.key == 'up') {
        this.lastMovementCommandY = (-1)* this.player.playerBuffs.stats.movementSpeed;
        this.lastMovementCommandYTime = keys.time;
        this.keys.up = 1;
    }
    if (keys.key == 'down') {
        this.lastMovementCommandY = this.player.playerBuffs.stats.movementSpeed;
        this.lastMovementCommandYTime = keys.time;
        this.keys.down = 1;
    }

    // update position
    this.player.chamber.chamberStats.addLastPlayerPosition(this.player.getPosition(), keys.position);;
    this.player.setPosition(keys.position);
}



/* handleKeyRelease
 *
 * handle the key releases by the clients
 * - update position (sent also by the client)
 * - set new direction
 */
PlayerInput.prototype.handleKeyRelease = function(keys) {
    if (keys.key == 'left' && this.keys.left == 1) {
        // Update position
        this.updatePosXonKeyRelease(keys);

        // And reset movement
        this.lastMovementCommandX = 0;
        this.keys.left = 0;
    }
    if (keys.key == 'right'  && this.keys.right == 1) {
        // Update position
        this.updatePosXonKeyRelease(keys);

        // And reset movement
        this.lastMovementCommandX = 0;
        this.keys.right = 0;
    }

    if (keys.key == 'up'  && this.keys.up == 1) {
        // Update position
        this.updatePosYonKeyRelease(keys);

        // And reset movement
        this.lastMovementCommandY = 0;
        this.keys.up = 0;
    }
    if (keys.key == 'down' && this.keys.down == 1) {
        // Update position
        this.updatePosYonKeyRelease(keys);

        // And reset movement
        this.lastMovementCommandY = 0;
        this.keys.down = 0;
    }

    // Update stats
    this.player.chamber.chamberStats.addLastPlayerPosition(this.player.getPosition(), keys.position);;

    // update position
    this.player.setPosition(keys.position);
}



/*** Updates Locations ***/

PlayerInput.prototype.updatePosition = function(timeDiff) {
    this.updatePositionX(timeDiff);
    this.updatePositionY(timeDiff);
}


/* updatePositionX
 *
 * called by update()
 * updates position according to the set keys
 */
PlayerInput.prototype.updatePositionX = function(timeDiff) {
    if (this.keys.left == 1 || this.keys.right == 1) {
        var distance = timeDiff * this.lastMovementCommandX / 1000;
        this.lastMovementCommandXTime += timeDiff;
        this.player.updatePhysicsBodyPosX(distance);
    }
}


/* updatePositionY
 *
 * called by update()
 * updates position according to the set keys
 */
PlayerInput.prototype.updatePositionY = function(timeDiff) {
    if (this.keys.up == 1 || this.keys.down == 1) {
        var distance = timeDiff * this.lastMovementCommandY / 1000;
        this.lastMovementCommandYTime += timeDiff;
        this.player.updatePhysicsBodyPosY(distance);
    }
}


/* updatePosXonKeyRelease
 *
 * called by keyRelease
 * updates position according to the remaining time
 * NOTE: probably unecessary
 */
PlayerInput.prototype.updatePosXonKeyRelease = function(keys) {
    var timediff = keys.time - this.lastMovementCommandXTime;
    this.updatePositionX(timediff);
}


/* updatePosYonKeyRelease
 *
 * called by keyRelease
 * updates position according to the remaining time
 * NOTE: probably unecessary
 */
PlayerInput.prototype.updatePosYonKeyRelease = function(keys) {
    var timediff = keys.time - this.lastMovementCommandYTime;
    this.updatePositionY(timediff);
}