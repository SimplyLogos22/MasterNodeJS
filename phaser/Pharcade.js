
var fs = require('fs');
var vm = require("vm");

filedata = fs.readFileSync('./phaser/Phaser.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./phaser/utils/Utils.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./phaser/math/Math.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./phaser/math/QuadTree.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./phaser/geom/Point.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./phaser/geom/Rectangle.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./phaser/Physics.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./phaser/physics/World.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./phaser/physics/Body.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./phaser/physics/TilemapCollision.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./phaser/gameobjects/components/LifeSpan.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./phaser/gameobjects/components/InWorld.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./phaser/gameobjects/components/Core.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./phaser/gameobjects/components/Events.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./phaser/gameobjects/components/PhysicsBody.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./phaser/core/Signal.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./phaser/geom/Matrix.js','utf8');
eval(filedata);

PIXI.Matrix = Phaser.Matrix;

filedata = fs.readFileSync('./phaser/pixi/display/DisplayObject.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./phaser/pixi/display/DisplayObjectContainer.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./phaser/core/Stage.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./phaser/core/Group.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./phaser/core/World.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./phaser/core/FakeWorld.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./phaser/core/FakeStage.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./phaser/core/FakeSprite.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./phaser/core/FakeFactory.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./phaser/core/FakeGame.js','utf8');
eval(filedata);


/*module.exports = {
    Phaser: Phaser,
}*/
module.exports = Phaser;
