"use strict";


/* Chamberstats
 *
 * Contains statistics about the chamber (or, server)
 * mostly performance metrics
 */
function ChamberStats() {

    // All teh stats
    this.stats = {
        // Max and min server sleep time
        // How much the server does sleep() in the main update loop
        // So we can see how much time the sever uses
        //   (more sleep is better)
        sleepTime: {
            max: 0,
            min: 100000,
        },

        // The latest player position
        // Usually updated on onKeyRelease
        // No old values / history, just the most current one
        // To display in client as debug mechanism
        lastPlayerPosition: {
            server: {
                x: 0,
                y: 0,
            },
            client: {
                x: 0,
                y: 0,
            }
        },

        // History of last player position differences
        // to see how much it diffs on average
        playerPositionDiff: {
            queue: [],
            maxQueueLen: 16,
        }
    }
}
ChamberStats.prototype.constructor = ChamberStats;

module.exports = ChamberStats;


/* Calculate Player Position Diff
 *
 * - finds minimum diff
 * - finds maximum diff
 * - calculate average diff of the last playerPosDiff.length entries
 */
ChamberStats.prototype.calcPlayerPositionDiff = function() {
    var posDiff = {
        avg: 0,
        min: 100000,
        max: 0,
    }

    var n;
    var curr;
    var total = 0;
    for (n=0; n<this.stats.playerPositionDiff.queue.length; n++) {
        curr = this.stats.playerPositionDiff.queue[n];
        if (curr > posDiff.max) {
            posDiff.max = curr;
        }
        if (curr < posDiff.min) {
            posDiff.min = curr;
        }
        total += curr;
    }
    if (this.stats.playerPositionDiff.queue.length > 0) {
        posDiff.avg = total / this.stats.playerPositionDiff.queue.length;
    } else {
        posDiff.avg = 0;
    }
    return posDiff;
}



ChamberStats.prototype.addLastPlayerPosition = function(serverPos, clientPos) {
    this.stats.lastPlayerPosition.server = serverPos;
    this.stats.lastPlayerPosition.client = clientPos;

    // Calculate diff
    var dx = serverPos.x - clientPos.x;
    var dy = serverPos.y - clientPos.y;
    var d = (dx + dy) / 2;

    // Add to queue
    this.stats.playerPositionDiff.queue.push(d)

    // Shorten queue if necessary
    if (this.stats.playerPositionDiff.queue.length > this.stats.playerPositionDiff.maxQueueLen) {
        this.stats.playerPositionDiff.queue.shift();
    }
}



ChamberStats.prototype.addServerSleepTime = function(sleepTime) {
    if (sleepTime < this.stats.sleepTime.min) {
        this.stats.sleepTime.min = sleepTime;
    }
    if (sleepTime > this.stats.sleepTime.max && sleepTime < 450) {
        this.stats.sleepTime.max = sleepTime;
    }
}


ChamberStats.prototype.getStatistics = function() {
    var statistics = [];
    this.chamber.playerGroup.forEachExists(function(player) {
        statistics.push(player.playerStatistics.get());
    }, this);
    return statistics;
}


ChamberStats.prototype.getStats = function() {
    var stats = {
        sleepTime: this.stats.sleepTime,
        lastPlayerPosition: this.stats.lastPlayerPosition,
        playerPositionDiff: this.calcPlayerPositionDiff(),
    }
    return stats;
}



