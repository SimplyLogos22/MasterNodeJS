"use strict";

var Utils = require('./../../utils.js');

function AttackSpeedBuff(game, parentPlayer) {
    this.game = game;
    this.parentPlayer = parentPlayer;

    this.defaultCooldown = 1000;
    this.defaultLifeSpan = 3000;

    this.nextFire = 0;
}
AttackSpeedBuff.prototype.constructor = AttackSpeedBuff;

module.exports = AttackSpeedBuff;


// TODO later
AttackSpeedBuff.prototype.activateLocal = function() {
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
        weaponType: "AttackSpeed",
    };
    networkSocket.sendFireEvent(fireEvent);
}



AttackSpeedBuff.prototype.activateNetwork = function() {
    this.activate();
}



AttackSpeedBuff.prototype.activate = function() {
    this.parentPlayer.weaponBullet.fireRate = 125;
    this.parentPlayer.playerBuffs.stats.attackSpeed = 2;
    setTimeout(this.deactivate.bind(this), this.defaultLifeSpan);
}



AttackSpeedBuff.prototype.deactivate = function() {
    this.parentPlayer.weaponBullet.fireRate = 250;
    this.parentPlayer.playerBuffs.stats.attackSpeed = 1;
}


/* Check if firing the weapon is allowed
 *
 * uses this.nextFire and this.fireRate
 */
AttackSpeedBuff.prototype.isFireAllowed = function() {
    if (this.game.time.time < this.nextFire) {
        return false;
    } else {
        this.nextFire = this.game.time.time + this.defaultCooldown;
        return true;
    }
}