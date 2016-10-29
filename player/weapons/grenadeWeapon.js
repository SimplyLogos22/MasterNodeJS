"use strict";

var GrenadeAmmo = require('./grenadeAmmo.js');
var Pharcade = require('./../../phaser/Pharcade.js')


/* GrenadeWeapon
 *
 * Contains the main (left-click) weapon of the players
 * Has several BulletAmmo which we can shoot
 */
function GrenadeWeapon(chamber, player) {
    this.chamber = chamber;
    this.parentPlayer = player;

    this.fireRate = 1000; // Time between grenades

    // Make me a group
    Pharcade.Group.call(this, this.chamber.game, null, 'grenadeGroup', true, true, Phaser.Physics.ARCADE);

    // Create some ammo
    var a;
    for(var n=0; n<4; n++) {
        a = new GrenadeAmmo.GrenadeAmmo(chamber, this);
        this.add(a);
    }
}
GrenadeWeapon.prototype = Object.create(Phaser.Group.prototype);
GrenadeWeapon.prototype.constructor = GrenadeWeapon;


module.exports = GrenadeWeapon;



/* updateAllAmmo
 *
 */
GrenadeWeapon.prototype.updateAllAmmo = function(timeDiff, currentTime) {
    this.forEachExists(function(grenadeAmmo) {
        grenadeAmmo.updateAmmo(timeDiff, currentTime);
    });
}



/* fireNewBullet
 *
 * gets a nonexisting ammo and fires it
 *
 * TODO ANTICHEAT: Check interval between firing
 */
GrenadeWeapon.prototype.fireNewBullet = function(data) {
    this.getFirstExists(false).spawn(data);
}
