"use strict";

function ZombieInput(player) {
    this.player = player;

    // Keys
    this.keys = {
        'left': 0,
        'up': 0,
        'down': 0,
        'right': 0
    }
}
ZombieInput.prototype.constructor = ZombieInput;

module.exports = ZombieInput;


/** Handle keys **/


ZombieInput.prototype.moveDirection = function(direction) {
    // Dont do anything if we already moved in this direction
    if (this.isMoving(direction)) {
        return;
    }

    // We changed direction - cancel previous one's
    var prevDir = this.getCurrentDirection();
    this.cancelMovementByDirection(prevDir);

    // Issue new direction
    this.newDirection(direction);
}



ZombieInput.prototype.isMoving = function(direction) {
    if (direction == 'left' && this.keys.left == 1) {
        return true;
    }
    if (direction == 'right' && this.keys.right == 1) {
        return true;
    }
    if (direction == 'up' && this.keys.up == 1) {
        return true;
    }
    if (direction == 'down' && this.keys.down == 1) {
        return true;
    }

    return false;
}

ZombieInput.prototype.getCurrentDirection = function(direction) {
    if (this.keys.left == 1) {
        return 'left';
    }
    if (this.keys.right == 1) {
        return 'right';
    }
    if (this.keys.down == 1) {
        return 'down';
    }
    if (this.keys.up == 1) {
        return 'up';
    }
}



ZombieInput.prototype.cancelMovementByDirection = function(direction) {
    if (direction == undefined) {
        return;
    }

    if (direction == 'left') {
        this.keys.left = 0;
    }
    if (direction == 'right') {
        this.keys.right = 0;
    }
    if (direction == 'up') {
        this.keys.up = 0;
    }
    if (direction == 'down') {
        this.keys.down = 0;
    }

    this.netSendKey(direction, 'release');

}



ZombieInput.prototype.cancelMovement = function() {
    var prevDir = this.getCurrentDirection();
    this.cancelMovementByDirection(prevDir);
}



ZombieInput.prototype.newDirection = function(direction) {
    //console.log("-> New direction: " + direction);

    if (direction == 'left') {
        this.keys.left = 1;
    }
    if (direction == 'right') {
        this.keys.right = 1;
    }
    if (direction == 'up') {
        this.keys.up = 1;
    }
    if (direction == 'down') {
        this.keys.down = 1;
    }

    this.netSendKey(direction, 'press');
}



ZombieInput.prototype.netSendKey = function(key, opt) {
    var keys = {
        clientId: this.player.clientId,
        key: key,
        position: this.player.getPosition(),
    }

    if (opt == 'press') {
        //console.log("! NET keyPress: " + key);
        this.player.chamber.network.sendKeyPressEvent( keys );
    } else if (opt == 'release') {
        //console.log("! NET releaseKey: " + key);
        this.player.chamber.network.sendKeyReleaseEvent( keys );
    }
}


/*** Updates Locations ***/

ZombieInput.prototype.updatePosition = function(timeDiff) {
    this.updatePositionX(timeDiff);
    this.updatePositionY(timeDiff);
}



/* updatePositionX
 *
 * called by update()
 * updates position according to the set keys
 */
ZombieInput.prototype.updatePositionX = function(timeDiff) {
    var xdir;
    if (this.keys.left == 1) {
        xdir = -1;
    } else if (this.keys.right == 1) {
        xdir = 1;
    } else {
        return;
    }

    var distance = xdir * timeDiff * this.player.buffs.stats.movementSpeed / 1000;
    this.player.updatePhysicsBodyPosX(distance);
}



/* updatePositionY
 *
 * called by update()
 * updates position according to the set keys
 */
ZombieInput.prototype.updatePositionY = function(timeDiff) {
    var ydir;
    if (this.keys.down == 1) {
        ydir = 1;
    } else if (this.keys.up == 1) {
        ydir = -1;
    } else {
        return;
    }

    var distance = ydir * timeDiff * this.player.buffs.stats.movementSpeed / 1000;
    this.player.updatePhysicsBodyPosY(distance);
}



ZombieInput.prototype.getForNetwork = function() {
    var data = {
        keys: this.keys,
    };
    return data;
}