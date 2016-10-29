var AttackSpeedBuff = require('./attackSpeedBuff.js');
var InvisibilityBuff = require('./invisibilityBuff.js');
var MovementSpeedBuff = require('./movementSpeedBuff.js');
var ShieldBuff = require('./shieldBuff.js');


module.exports = {
    AttackSpeed: AttackSpeedBuff,
    MovementSpeed: MovementSpeedBuff,
    Invisibility: InvisibilityBuff,
    Shield: ShieldBuff,
}