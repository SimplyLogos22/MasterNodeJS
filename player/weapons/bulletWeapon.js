"use strict";

var BulletAmmo = require('./bulletAmmo.js');
var Pharcade = require('./../../phaser/Pharcade.js')


/* BulletWeapon
 *
 * Contains the main (left-click) weapon of the players
 * Has several BulletAmmo which we can shoot
 */
function BulletWeapon(chamber, player) {
    this.chamber = chamber;
    this.parentPlayer = player;

    this.fireRate = 250; // Time between bullets

    // Make me a group
    Pharcade.Group.call(this, this.chamber.game, null, 'bulletGroup', true, true, Phaser.Physics.ARCADE);

    // Create some ammo
    for(var n=0; n<8; n++) {
        this.add( new BulletAmmo.BulletAmmo(chamber, this) );
    }
}
BulletWeapon.prototype = Object.create(Phaser.Group.prototype);
BulletWeapon.prototype.constructor = BulletWeapon;


module.exports = BulletWeapon;



/* updateAllAmmo
 *
 * Updates position of all our ammo
 */
BulletWeapon.prototype.updateAllAmmo = function(timeDiff, currentTime) {
    this.forEachExists(function(bulletAmmo) {
        bulletAmmo.updateAmmo(timeDiff, currentTime);
    });
}



/* fireNewBullet
 *
 * gets a nonexisting ammo and fires it
 *
 * TODO ANTICHEAT: Check interval between firing
 */
BulletWeapon.prototype.fireNewBullet = function(fireEventData) {
    this.getFirstExists(false).spawn(fireEventData);
}
