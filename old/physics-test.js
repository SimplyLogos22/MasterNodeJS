/**
 * Created by dobin on 13.12.15.
 */

var fs = require('fs');
var vm = require("vm");

filedata = fs.readFileSync('./Phaser.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./utils/Utils.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./math/Math.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./math/QuadTree.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./geom/Point.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./geom/Rectangle.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./Physics.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./physics/World.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./physics/Body.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./physics/TilemapCollision.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./gameobjects/components/LifeSpan.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./gameobjects/components/InWorld.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./gameobjects/components/Core.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./gameobjects/components/Events.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./gameobjects/components/PhysicsBody.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./core/Signal.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./geom/Matrix.js','utf8');
eval(filedata);

PIXI.Matrix = Phaser.Matrix;

filedata = fs.readFileSync('./pixi/display/DisplayObject.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./pixi/display/DisplayObjectContainer.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./core/Stage.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./core/Group.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./core/World.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./core/FakeWorld.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./core/FakeStage.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./core/FakeSprite.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./core/FakeFactory.js','utf8');
eval(filedata);

filedata = fs.readFileSync('./core/FakeGame.js','utf8');
eval(filedata);

var game = new FakeGame(800, 600);

console.log("Main Start");

var fakeSprite;
var fakeSprite2;
var fakeGroup;
var fakeGroup2;

function getCurrentTime() {
    return new Date().getTime()
}

function init() {
    // 1
    fakeSprite = game.add.sprite(20, 32, 16, 16);
    fakeSprite.name = "a1";
    fakeSprite.position.x = 20;
    fakeSprite.position.y = 32;

    game.physics.enable(fakeSprite, Phaser.Physics.ARCADE);
    fakeGroup1 = new Phaser.Group(game, null, "testGroup1", true, true)
    fakeGroup1.add(fakeSprite1);

    //fakeSprite.body.velocity.x = 100;
    fakeSprite.body.collideWorldBounds = true;

    // 2, static
    fakeSprite2 = game.add.sprite(64, 32, 16, 16);
    fakeSprite2.name = "a2";
    game.physics.enable(fakeSprite2, Phaser.Physics.ARCADE);
    fakeSprite2.position.x = 64;
    fakeSprite2.position.y = 32;
    fakeSprite2.body.collideWorldBounds = true;
    fakeSprite2.body.immovable = true;

    // 3, group
    fakeGroup2 = new Phaser.Group(game, null, "testGroup", true, true)
    fakeGroup2.add(fakeSprite2);
}


var tickrate = 66;
var lastUpdateTime = getCurrentTime();

function update() {
    //      console.log("Update");

    // time1 is the reference time
    var time1 = getCurrentTime();

    // Update how much time passed since last update
    var timeSinceLastUpdate = time1 - lastUpdateTime;
    lastUpdateTime = time1;


    game.setElapsedTime(timeSinceLastUpdate);

    // update all sprites!
    // preupdate: set body position
    game.preUpdate();


    // Update body position here!
    if (timeSinceLastUpdate > 0) {
        fakeSprite.body.position.x += timeSinceLastUpdate * 10 / 1000;
    }

    // works here!
    //game.physics.arcade.collide(fakeSprite, fakeSprite2, collDebug);
    game.physics.arcade.collide(fakeSprite, fakeGroup, collDebug);


    // postupdate: set sprite position
    // update all sprites!
    game.postUpdate();


    // works here!
    //game.physics.arcade.overlap(fakeSprite, fakeGroup, overlapDebug);
    //game.physics.arcade.overlap(fakeSprite, fakeSprite2, overlapDebug);


    // Debug
    myDebug(time1);


    // Calculate how long we should sleep to keep
    // constant tickrate
    var time2 = getCurrentTime();
    var diffTime = time2 - time1;
    var sleepTime = (1000 / tickrate) - diffTime;
    setTimeout(update, sleepTime);
}

function overlapDebug(a, b) {
    console.log("Overlap!");
    // console.log("  A: " + a.position.x + " W: " + a.width);
    // console.log("  B: " + b.position.x + " W: " + b.width);
}

function collDebug(a, b) {
    //console.log("Collision!");
    //  console.log("  A: " + a.position.x + " W: " + a.width);
    //  console.log("  B: " + b.position.x + " W: " + b.width);
}

function start() {
    console.log("Start");
    init();
    update();
}

var debugTime = 0;
function myDebug(curr) {

    if (curr - debugTime < 1000) {
        return;
    }

    console.log("Pos1: "
        + fakeSprite.position.x
        + " / "
        + fakeSprite.position.y
    );
    console.log("Pos2: "
        + fakeSprite2.position.x
        + " / "
        + fakeSprite2.position.y
    );

    debugTime = curr;
}

start();