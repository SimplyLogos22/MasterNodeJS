"use strict";

var Utils = require('./../../utils.js');
var Pharcade = require('./../../phaser/Pharcade.js')


/* GrenadeAmmo
 *
 * The bullets the players shoot primarily, through BulletWeapon
 * This fakeSprite really travels through the world and hits things
 *
 */
function GrenadeAmmo(chamber, parentWeapon) {
    this.chamber = chamber;
    this.parentWeapon = parentWeapon;

    // Make me a fakeSprite
    Pharcade.Sprite.call(this, this.chamber.game, 0, 0, 'bullet1');


    // this needs probably to be updated
    this.lifetime = 100;

    // original size is 96, but we substract a bit so it feels nicer
    this.width = 96 - 12;
    this.height = 96 - 12;

    this.activateTime = 0;
    this.exists = false;
    this.chamber.game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.moves = false;
    this.myType = "grenade";
    this.parentAmmo = this;
    this.player = this.parentWeapon.parentPlayer;
}
GrenadeAmmo.prototype = Object.create(Phaser.Sprite.prototype);
GrenadeAmmo.prototype.constructor = GrenadeAmmo;


module.exports = {
    GrenadeAmmo: GrenadeAmmo
}



/* UpdateAmmo
 *
 * Updates the position of this bullet in the world
 * - position
 * - lifetime
 *
 */
GrenadeAmmo.prototype.updateAmmo = function(timeDiff, currentTime) {
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
GrenadeAmmo.prototype.deactivateMe = function() {
    this.exists = false;
}



/* Spawn
 *
 * Spawn the grenade
 * - at position position
 *
 * TODO: Anticheat
 */
GrenadeAmmo.prototype.spawn = function(fireEventData) {
    if ('destination' in fireEventData
        && Utils.isNumeric(fireEventData.destination.x)
        && Utils.isNumeric(fireEventData.destination.y))
    {
        this.activateTime = Utils.getCurrentTime();
        this.deactivateTime = this.activateTime + this.lifetime;

        this.respawnMe(fireEventData.destination.x, fireEventData.destination.y);
        this.exists = true;
    } else {
        console.error("GrenadeAmmo: Invalid client data");
    }
}
