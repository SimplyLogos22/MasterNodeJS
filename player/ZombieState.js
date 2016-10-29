"use strict";

var winston = require('winston');
var AbstractState = require('./AbstractState.js');

/* ZombieState
 *
 * Handles all state changes of the zombie (between alive and dead)
 *
 */
function ZombieState(player) {
    AbstractState.call(this, player)
    this.initDefaultStats();
}
ZombieState.prototype = Object.create(AbstractState.prototype);
ZombieState.prototype.constructor = ZombieState;

module.exports = ZombieState;


ZombieState.prototype.getState = function() {
    return this.playerState;
}


/** Game interactions **/

ZombieState.prototype.initDefaultStats = function() {
    this.stats.health = 100;
    this.stats.maxHealth = 100;
}


ZombieState.prototype.handleBulletHit = function(sourcePlayer) {
    if (this.stats.health > 10) {
        this.stats.health -= 10;

        // Send new stats to all players
        this.netSendPlayerStatsUpdate();
    } else {
        this.die();
    }
}



ZombieState.prototype.handleGrenadeHit = function(sourcePlayer) {
    this.handleBulletHit(sourcePlayer);
}



ZombieState.prototype.dieHandler = function() {
    this.respawnMe();
}



ZombieState.prototype.respawnHandler = function() {
    var pos = this.chamber.map.generateRandomWalkableCoordinates();
    return pos;
}

