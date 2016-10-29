"use strict";

var Pharcade = require('./../../phaser/Pharcade.js')
var Powerup = require('./Powerup.js');


/* PowerupGroup
 *
 * @class PowerupGroup
 * @constructor
 * @extends Phaser.Group
 *
 */
function PowerupGroup(chamber, map) {
    this.chamber = chamber;
    this.map = map;

    // Make me a group
    Pharcade.Group.call(this, this.chamber.game, null, 'powerupGroup', true, true, Phaser.Physics.ARCADE);

    // Create some powerups
    // The distribution here will be used all through the game
    var n=0;
    while(n<64) {
        this.add( new Powerup(chamber, 'health', n++) );
        this.add( new Powerup(chamber, 'barrier', n++) );
        this.add( new Powerup(chamber, 'grenade', n++) );
        //this.add( new Powerup(chamber, 'buff', n++) );
    }
}
PowerupGroup.prototype = Object.create(Phaser.Group.prototype);
PowerupGroup.prototype.constructor = PowerupGroup;


module.exports = PowerupGroup;



PowerupGroup.prototype.startMapInit = function() {
    this.getFirstExists(false).spawn({ x: 100, y: 100});

    for(var n=0; n<32; n++) {
        this.getFirstExists(false).spawn(
            this.map.generateRandomWalkableCoordinates()
        );
    }

}



PowerupGroup.prototype.spawnNew = function() {
    var powerup = this.getFirstExists(false);
    powerup.spawn(this.map.generateRandomWalkableCoordinates());
    return powerup;
}



PowerupGroup.prototype.getAllAsArrayForNetwork = function() {
    var powerups = [];

    this.forEachExists(function (powerup) {
        powerups.push (powerup.getForNetwork());
    }, this);

    return powerups;
}
