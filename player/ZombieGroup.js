"use strict";

var Pharcade = require('./../phaser/Pharcade.js')
var Zombie = require('./zombie.js');


/* ZombieGroup
 *
 * @class ZombieGroup
 * @constructor
 * @extends Phaser.Group
 *
 */
function ZombieGroup(chamber, map) {
    this.chamber = chamber;
    this.map = map;

    // Make me a group
    Pharcade.Group.call(this, this.chamber.game, null, 'ZombieGroup', true, true, Phaser.Physics.ARCADE);

    this.zombieNr = 16;
    // Create some Zombies
    // The distribution here will be used all through the game
    var n=0;
    while(n<this.zombieNr) {
        this.add( new Zombie(chamber, '1', n++) );
        //this.add( new Zombie(chamber, '2', n++) );
        //this.add( new Zombie(chamber, '3', n++) );
    }
}
ZombieGroup.prototype = Object.create(Phaser.Group.prototype);
ZombieGroup.prototype.constructor = ZombieGroup;


module.exports = ZombieGroup;



ZombieGroup.prototype.startMapInit = function() {
    //this.getFirstExists(false).spawn({ x: 976, y: 1104});

    //this.getFirstExists(false).spawn({ x: 944, y: 176});
    //this.getFirstExists(false).spawn({ x: 976, y: 976});

    for(var n=0; n<this.zombieNr; n++) {
        this.getFirstExists(false).spawn(
            this.map.generateRandomWalkableCoordinates()
        );
    }
}



ZombieGroup.prototype.spawnNew = function() {
    var Zombie = this.getFirstExists(false);
    Zombie.spawn(this.map.generateRandomWalkableCoordinates());
    return Zombie;
}



ZombieGroup.prototype.getAllAsArrayForNetwork = function() {
    var Zombies = [];

    this.forEachExists(function (Zombie) {
        Zombies.push (Zombie.getForNetwork());
    }, this);

    return Zombies;
}
