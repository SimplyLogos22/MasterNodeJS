"use strict";

function InvisibilityBuff(game, parentPlayer) {
    this.game = game;
    this.parentPlayer = parentPlayer;

    this.defaultCooldown = 1000;
    this.defaultLifeSpan = 3000;

    this.nextFire = 0;
}
InvisibilityBuff.prototype.constructor = InvisibilityBuff;

module.exports = InvisibilityBuff;


// TODO later
InvisibilityBuff.prototype.activateLocal = function() {
    if (! this.isFireAllowed() ) {
        return;
    }

    this.activate(0.5);

    // Send via network
    var fireEvent = {
        position: {
            x: 0,
            y: 0,
        },
        weaponType: "Invisibility",
    };
    networkSocket.sendFireEvent(fireEvent);
}



InvisibilityBuff.prototype.activateNetwork = function() {
    this.activate();
}



InvisibilityBuff.prototype.activate = function() {
    this.parentPlayer.playerBuffs.stats.invisibility = true;

    setTimeout(this.deactivate.bind(this), this.defaultLifeSpan);
}


InvisibilityBuff.prototype.deactivate = function() {
    this.parentPlayer.playerBuffs.stats.invisibility = false;
}


/* Check if firing the weapon is allowed
 *
 * uses this.nextFire and this.fireRate
 */
InvisibilityBuff.prototype.isFireAllowed = function() {
    if (this.game.time.time < this.nextFire) {
        return false;
    } else {
        this.nextFire = this.game.time.time + this.defaultCooldown;
        return true;
    }
}