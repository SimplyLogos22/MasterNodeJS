"use strict";

var Utils = require('./../../utils.js');
var Pharcade = require('./../../phaser/Pharcade.js')


/* BulletAmmo
 *
 * The bullets the players shoot primarily, through BulletWeapon
 * This fakeSprite really travels through the world and hits things
 *
 */
function BulletAmmo(chamber, parentWeapon) {
    this.chamber = chamber;
    this.parentWeapon = parentWeapon;

    // Make me a fakeSprite
    Pharcade.Sprite.call(this, this.chamber.game, 0, 0, 'bullet1');

    // Same as in client
    this.lifetime = 1000;
    this.stdVelocity = 500;
    this.width = 32;
    this.height = 32;

    // Sensible defaults
    // set velocity here, dont overwrite this.velocity, as it is used by phaser
    this.myVelocity = {
        'x': 0,
        'y': 0
    }
    this.activateTime = 0;
    this.deactivateTime = 0;
    this.exists = false;
    this.chamber.game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.collideWorldBounds = true;

    this.myType = "bullet";
    this.body.myType = 'bullet';
    this.player = this.parentWeapon.parentPlayer;
}
BulletAmmo.prototype = Object.create(Phaser.Sprite.prototype);
BulletAmmo.prototype.constructor = BulletAmmo;


module.exports = {
    BulletAmmo: BulletAmmo
}



/* UpdateAmmo
 *
 * Updates the position of this bullet in the world
 * - position
 * - lifetime
 *
 */
BulletAmmo.prototype.updateAmmo = function(timeDiff, currentTime) {
    // Update position
    var dx = this.myVelocity.x * timeDiff / 1000;
    var dy = this.myVelocity.y * timeDiff / 1000;
    this.body.position.x += dx;
    this.body.position.y += dy;

    // Lifetime
    if (currentTime > this.deactivateTime) {
        this.deactivateMe();
    }
}



/* DeactivateMe
 *
 * Deactives bullet in the world
 * No more position updates, collisions etc.
 * Can be re-used if false
 */
BulletAmmo.prototype.deactivateMe = function() {
    this.exists = false;
}



/* Spawn
 *
 * Spawn the bullet
 * - at position position
 * - with angle angle
 * - my index is index (same as in the client)
 *
 * TODO: Anticheat
 */
BulletAmmo.prototype.spawn = function(fireEventData) {
    if ('angle' in fireEventData && Utils.isNumeric(fireEventData.angle)
        && 'index' in fireEventData && Utils.isNumeric(fireEventData.index))
    {
        // shoot from player position
        var srcPosition = this.player.getPosition();
        // the index (set by the client) of the ammo (a player-unique id)
        var index = fireEventData.index;
        // at this angle
        var angle = fireEventData.angle;

        this.activateTime = Utils.getCurrentTime();
        this.deactivateTime = this.activateTime + this.lifetime;

        this.index = index;

        // We just have the angle
        // calculate the velocity in x/y direction
        this.myVelocity = {
            'x': this.stdVelocity * Math.cos(angle),
            'y': this.stdVelocity * Math.sin(angle),
        }

        // Spawn position
        this.respawnMe(srcPosition.x, srcPosition.y);
        this.exists = true;
    } else {
        console.error("BulletAmmo: Invalid client data");
    }

}
