"use strict";

var Utils = require('./../../utils.js');
var Pharcade = require('./../../phaser/Pharcade.js')


/* BarrierAmmo
 *
 * The bullets the players shoot primarily, through BulletWeapon
 * This fakeSprite really travels through the world and hits things
 *
 */
function BarrierAmmo(chamber, parentWeapon, index) {
    this.chamber = chamber;
    this.parentWeapon = parentWeapon;
    this.index = index;

    // Make me a fakeSprite
    Pharcade.Sprite.call(this, this.chamber.game, 0, 0, 'bullet1');

    // this needs probably to be updated
    this.lifetime = 3000;

    this.activateTime = 0;
    this.exists = false;
    this.chamber.game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.immovable = true;

    this.myType = "barrier";
    this.body.myType = 'barrier';
    this.body.moves = false; // we dont move a bit
    this.player = this.parentWeapon.parentPlayer;
}
BarrierAmmo.prototype = Object.create(Phaser.Sprite.prototype);
BarrierAmmo.prototype.constructor = BarrierAmmo;


module.exports = {
    BarrierAmmo: BarrierAmmo
}



/* UpdateAmmo
 *
 * Updates the position of this bullet in the world
 * - lifetime
 *
 */
BarrierAmmo.prototype.updateAmmo = function(timeDiff, currentTime) {
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
BarrierAmmo.prototype.deactivateMe = function() {
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
BarrierAmmo.prototype.spawn = function(fireEventData) {
    if ('destination' in fireEventData
        && Utils.isNumeric(fireEventData.destination.x)
        && Utils.isNumeric(fireEventData.destination.y)
        && 'size' in fireEventData
        && Utils.isNumeric(fireEventData.size.height)
        && Utils.isNumeric(fireEventData.size.width))
    {
        this.activateTime = Utils.getCurrentTime();
        this.deactivateTime = this.activateTime + this.lifetime;

        // how it looks like
        this.height = fireEventData.size.height;
        this.width = fireEventData.size.width;

        // Spawn position
        this.respawnMe(fireEventData.destination.x, fireEventData.destination.y);
        this.exists = true;
    } else {
        console.error("BulletAmmo: Invalid client data");
    }
}
