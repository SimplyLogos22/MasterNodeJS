"use strict";

var Utils = require('./utils.js');
var Chamber = require('./chamber/chamber.js');


/* Game.js
 *
 * - Manages chambers
 * - Handles the main game update loop
 */
function Game(mongoDB) {
    this.mongoDB = mongoDB;

    this.tickrate = 50; // amount of updates per second
    this.network = undefined; // gets set later
    this.chambers = [];
    this.lastUpdateTime = Utils.getCurrentTime();

    // Add chambers
    this.chambers.push( new Chamber.Chamber("chamber1", mongoDB) );
}

module.exports = {
    Game: Game
}



/* Update
 *
 * The game's main update loop
 *
 * We try to get called all 1/tickrate seconds, minus the processing we had done
 *
 */
Game.prototype.updateLoop = function() {
	// time1 is the reference time
	var time1 = Utils.getCurrentTime();

	// Update how much time passed since last update
	var timeSinceLastUpdate = time1 - this.lastUpdateTime;
	this.lastUpdateTime = time1;

    // Update all the chambers of this server
    var arePlayersActive = false;
    var ret;
    for(var n=0; n<this.chambers.length; n++) {
        ret = this.chambers[n].updateLoop(timeSinceLastUpdate, time1);
        if (ret) {
            arePlayersActive = true;
        }
    }
    // Reduce tickrate if we have no players
    if(arePlayersActive) {
        this.tickrate = 50;
    } else {
        this.tickrate = 50;
    }

	// Calculate how long we should sleep to keep constant tickrate
	var time2 = Utils.getCurrentTime();
	var diffTime = time2 - time1;
	var sleepTime = (1000 / this.tickrate) - diffTime;
	setTimeout(this.updateLoop.bind(this), sleepTime);
}



/* GetChamber
 *
 * Returns a chamber with space in it
 *
 */
Game.prototype.getChamberForNewPlayer = function() {
    return this.chambers[0];
}



/* Set Network
 *
 * called from game server
 * Sets network to all chambers
 *
 */
Game.prototype.setNetwork = function(wss) {
    this.network = wss;
    this.chambers[0].setNetwork(wss);
}


Game.prototype.getForWeb = function() {
    var c = [];
    for (var n = 0; n < this.chambers.length; n++) {
        c.push( this.chambers[n].getForWeb());
    }
    return c;
}

