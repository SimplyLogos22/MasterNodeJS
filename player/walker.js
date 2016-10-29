"use strict";

var Pharcade = require('./../phaser/Pharcade.js')


function Walker(game, chamber, position, man) {
    this.game = game;
    this.chamber = chamber;

    Pharcade.Sprite.call(this, this.chamber.game, position.x, position.y, 'walker');

    // Sprite stuff
    this.name = "player";
    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    this.myType = "player";
}
Walker.prototype = Object.create(Phaser.Sprite.prototype);
Walker.prototype.constructor = Walker;

module.exports = Walker;



Walker.prototype.update = function(timeDiff, currentTime) {
}



/* updatePhysicsBodyPosX
 *
 * Really update the actual position of the fakeSprite
 *
 */
Walker.prototype.updatePhysicsBodyPosX = function(distance) {
    if (isNaN(distance)) {
        winston.error("Error: Walker Distance is NaN");
        return;
    }

    this.body.position.x += distance;
}


/* updatePhysicsBodyPosY
 *
 * Really update the actual position of the fakeSprite
 *
 */
Walker.prototype.updatePhysicsBodyPosY = function(distance) {
    if (isNaN(distance)) {
        winston.error("Error: Walker Distance is NaN");
        return;
    }

    this.body.position.y += distance;
}



/** Helper **/

Walker.prototype.setPosition = function(position) {
    this.position.x = position.x;
    this.position.y = position.y;
}



Walker.prototype.getPosition = function() {
    var position = {
        'x': this.position.x,
        'y': this.position.y,
    }

    return position;
}



Walker.prototype.getCurrentTile = function() {
    var tile = {
        x: Math.floor(this.getPosition().x / 32),
        y: Math.floor(this.getPosition().y / 32),
    }
    return tile;
}
