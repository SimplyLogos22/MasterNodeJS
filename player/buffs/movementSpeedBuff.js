"use strict";

function MovementSpeedBuff(game, parentPlayer) {
    this.game = game;
    this.parentPlayer = parentPlayer;

    this.defaultCooldown = 5000; // ms
    this.defaultLifeSpan = 3000; // ms

    this.nextFire = 0;
}
MovementSpeedBuff.prototype.constructor = MovementSpeedBuff;

module.exports = MovementSpeedBuff;


// TODO later
MovementSpeedBuff.prototype.activateLocal = function() {
    if (! this.isFireAllowed() ) {
        return;
    }

    this.activate();

    // Send via network
    var fireEvent = {
        position: {
            x: 0,
            y: 0,
        },
        weaponType: "MovementSpeed",
    };
    networkSocket.sendFireEvent(fireEvent);
}



MovementSpeedBuff.prototype.activateNetwork = function() {
    this.activate();
}



MovementSpeedBuff.prototype.activate = function() {
    this.parentPlayer.playerBuffs.stats.movementSpeed = 300;
    setTimeout(this.deactivate.bind(this), this.defaultLifeSpan);
}



MovementSpeedBuff.prototype.deactivate = function() {
    this.parentPlayer.playerBuffs.stats.movementSpeed = 180;
}


/* Check if firing the weapon is allowed
 *
 * uses this.nextFire and this.fireRate
 */
MovementSpeedBuff.prototype.isFireAllowed = function() {
    if (this.game.time.time < this.nextFire) {
        return false;
    } else {
        this.nextFire = this.game.time.time + this.defaultCooldown;
        return true;
    }
}