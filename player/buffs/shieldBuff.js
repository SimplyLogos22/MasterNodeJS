"use strict";

function ShieldBuff(game, parentPlayer) {
    this.game = game;
    this.parentPlayer = parentPlayer;

    this.defaultCooldown = 5000; // ms
    this.defaultLifeSpan = 3000; // ms

    this.nextFire = 0;
}
ShieldBuff.prototype.constructor = ShieldBuff;

module.exports = ShieldBuff;



// TODO later
ShieldBuff.prototype.activateLocal = function() {
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
        weaponType: "Shield",
    };
    networkSocket.sendFireEvent(fireEvent);
}



ShieldBuff.prototype.activateNetwork = function() {
    this.activate();
}



ShieldBuff.prototype.activate = function() {
    this.parentPlayer.playerBuffs.stats.shield = true;
    setTimeout(this.deactivate.bind(this), this.defaultLifeSpan);
}



ShieldBuff.prototype.deactivate = function() {
    this.parentPlayer.playerBuffs.stats.shieldSpeed = false;
}


/* Check if firing the weapon is allowed
 *
 * uses this.nextFire and this.fireRate
 */
ShieldBuff.prototype.isFireAllowed = function() {
    if (this.game.time.time < this.nextFire) {
        return false;
    } else {
        this.nextFire = this.game.time.time + this.defaultCooldown;
        return true;
    }
}