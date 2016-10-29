"use strict";

var BarrierAmmo = require('./barrierAmmo.js');
var Pharcade = require('./../../phaser/Pharcade.js')


/* BarrierWeapon
 *
 * Contains the main (left-click) weapon of the players
 * Has several BulletAmmo which we can shoot
 */
function BarrierWeapon(chamber, player) {
    this.chamber = chamber;
    this.parentPlayer = player;

    this.fireRate = 1000; // Time between grenades

    // Make me a group
    Pharcade.Group.call(this, this.chamber.game, null, 'barrierGroup', true, true, Phaser.Physics.ARCADE);

    // Create some ammo
    var a;
    for(var n=0; n<4; n++) {
        a = new BarrierAmmo.BarrierAmmo(chamber, this, n);
        this.add(a);
    }
}
BarrierWeapon.prototype = Object.create(Phaser.Group.prototype);
BarrierWeapon.prototype.constructor = BarrierWeapon;


module.exports = BarrierWeapon;



/* updateAllAmmo
 *
 */
BarrierWeapon.prototype.updateAllAmmo = function(timeDiff, currentTime) {
    this.forEachExists(function(barrierAmmo) {
        barrierAmmo.updateAmmo(timeDiff, currentTime);
    }, this);
}



/* fireNewBullet
 *
 * gets a nonexisting ammo and fires it
 *
 * TODO ANTICHEAT: Check interval between firing
 */
BarrierWeapon.prototype.fireNewBullet = function(data) {
    this.getFirstExists(false).spawn(data);
}