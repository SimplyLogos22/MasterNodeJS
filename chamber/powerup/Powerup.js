"use strict";

var Utils = require('./../../utils.js');
var Pharcade = require('./../../phaser/Pharcade.js')


/* Powerup
 *
 * @class Powerup
 * @constructor
 * @extends Phaser.Sprite
 */
function Powerup(chamber, type, uniqueId) {
    this.chamber = chamber;
    this.uniqueId = uniqueId;
    this.powerupType = type;

    // Make me a fakeSprite
    Pharcade.Sprite.call(this, this.chamber.game, 0, 0, 'powerup');

    this.exists = false;

}
Powerup.prototype = Object.create(Phaser.Sprite.prototype);
Powerup.prototype.constructor = Powerup;


module.exports = Powerup;



Powerup.prototype.spawn = function(position) {
    this.position.x = position.x;
    this.position.y = position.y;

    this.exists = true;
}


Powerup.prototype.getForNetwork = function() {
    var p = {
        position: {
            x: this.position.x,
            y: this.position.y,
        },
        powerupType: this.powerupType,
        uniqueId: this.uniqueId,
    };

    return p;
}

Powerup.prototype.removeMe = function() {
    this.exists = false;
}