"use strict";

/* PlayerBuffs
 *
 *
 */
function PlayerBuffs(player) {
    this.player = player;

    this.initDefault();
}
PlayerBuffs.prototype.constructor = PlayerBuffs;

module.exports = PlayerBuffs;


PlayerBuffs.prototype.getState = function() {
    return this.stats;
}


PlayerBuffs.prototype.initDefault = function() {
    this.stats = {
        movementSpeed: 180,
        attackSpeed: 100,
    }
}


PlayerBuffs.prototype.getForNetwork = function() {
    return this.stats;
}