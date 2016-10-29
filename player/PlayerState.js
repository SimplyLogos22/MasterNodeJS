"use strict";

var winston = require('winston');
var AbstractState = require('./AbstractState.js');

/* PlayerState
 *
 * Handles all state changes of the player (between alive and dead)
 *
 */
function PlayerState(player) {
    AbstractState.call(this, player)
    this.initDefaultStats();
}
PlayerState.prototype = Object.create(AbstractState.prototype);
PlayerState.prototype.constructor = PlayerState;

module.exports = PlayerState;



PlayerState.prototype.getState = function() {
    return this.playerState;
};



PlayerState.prototype.initDefaultStats = function() {
    this.stats.health = 100;
    this.stats.maxHealth = 100;
};



PlayerState.prototype.handleBulletHit = function(sourcePlayer) {
    if (this.stats.health > 10) {
        this.stats.health -= 10;

        // Send new stats to all players
        this.netSendPlayerStatsUpdate();
    } else {
        // Update statistics
        sourcePlayer.playerStatistics.addFrag();
        this.player.playerStatistics.addDeath();

        // And die
        this.die();
    }
};



PlayerState.prototype.handleZombieHit = function(sourceZombie) {
    if (this.stats.health > 5) {
        this.stats.health -= 5;

        // Send new stats to all players
        this.netSendPlayerStatsUpdate();
    } else {
        // Update statistics
        this.player.playerStatistics.addDeath();

        // And die
        this.die();
    }
}



PlayerState.prototype.handleGrenadeHit = function(sourcePlayer) {
    this.handleBulletHit(sourcePlayer);
};



PlayerState.prototype.handlePowerup = function(powerupType) {
    // update my stats
    this.stats.health += 5;
    this.stats.maxHealth += 1;

    // and notify all
    this.netSendPlayerStatsUpdate();
};



PlayerState.prototype.dieHandler = function() {
    // Reset round statistics
    this.player.playerStatistics.resetRound();
}



PlayerState.prototype.respawnHandler = function() {
    /*var pos = {
        x: 64,
        y: 64
    };*/
    var pos = this.player.chamber.map.generateRandomWalkableCoordinates();
    return pos;
}



/* handlePlayerStateEvent
 *
 * handle state update from client
 * this is currently:
 * - wantRespawn (after he reached 'dead' state)
 */
PlayerState.prototype.handlePlayerStateEvent = function(playerState) {
    if (playerState.playerState == 'wantRespawn') {
        if (this.playerState == 'dead') {
            this.respawnMe();
        } else {
            winston.error("Player wants to respawn even though he is still alive.")
        }
    }
};

