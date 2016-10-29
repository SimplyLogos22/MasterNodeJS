"use strict";

function AbstractState(player) {
    this.player = player;
    this.chamber = player.chamber;

    this.playerState = 'alive';

    this.stats = {
        health: undefined,
        maxHealth: undefined,
    }
}
AbstractState.prototype.constructor = AbstractState;

module.exports = AbstractState;


AbstractState.prototype.dieHandler = function() {
}

AbstractState.prototype.respawnHandler = function() {
}


/* Die
 *
 * The player does not have any more life.
 * - Set him to state 'dead'
 * - Tell all players about it
 *
 */
AbstractState.prototype.die = function() {
    // TODO: resetKeys();
    this.playerState = 'dead';
    this.netSendPlayerStateUpdate();

    // We disable the player
    // So the dead body of the player is not involved in collision checks
    this.player.exists = false;


    this.dieHandler();
}


/* respawnMe
 *
 *
 */
AbstractState.prototype.respawnMe = function() {
    var pos = this.respawnHandler();
    this.player.respawnMe(pos.x, pos.y);

    this.player.exists = true;
    this.playerState = 'alive';

    this.initDefaultStats();
    this.netSendPlayerStateUpdate();
}



/* netSendPlayerStateUpdate
 *
 * Tell players of chamber the state of this player (dead or alive)
 * NOTE: ATM only 'dead' is used here
 */
AbstractState.prototype.netSendPlayerStateUpdate = function() {
    var data;
    if (this.playerState == 'dead') {
        data = {
            playerState: this.playerState,

            clientId: this.player.clientId,
            player: this.player.getForNetwork()
        };
        if (this.player.playerStatistics) {
            data.playerStatistics = this.player.playerStatistics.getStatistics('all');
        }
        this.chamber.network.sendUpdatePlayerStateEvent(data);
    }
    else if (this.playerState == 'alive')
    {
        data = {
            playerState: this.playerState,
            clientId: this.player.clientId,
            player: this.player.getForNetwork(),
            stats: this.stats
        };
        this.chamber.network.sendUpdatePlayerStateEvent(data);
    }
};



AbstractState.prototype.netSendPlayerStatsUpdate = function() {
    this.chamber.network.sendPlayerStatsUpdate( this.getForNetwork() );
}

/* getStateForNetwork
 *
 * get state from player, in network compatible format
 *
 */
AbstractState.prototype.getForNetwork = function() {
    var state = {
        clientId: this.player.clientId,
        playerState: this.getState(),
        stats: this.stats,
    };
    return state;
}



AbstractState.prototype.getState = function() {
    return this.playerState;
}


AbstractState.prototype.isAlive = function() {
    if (this.playerState == 'alive') {
        return true;
    } else {
        return false;
    }
}

