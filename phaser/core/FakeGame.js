
Phaser.FakeGame = function(width, height) {
    this.time = {
        physicsElapsed: 1/60,
    };

    this.state = {
        onStateChange: {
            add: function(a, b) {},
        }
    };

    this.width = width;
    this.height = height;

    this.camera = {
            x: 0,
            y: 0,
    };


    // Setup
    this.stage = new Phaser.Stage(this);
    this.world = new Phaser.World(this);

    this.stage.boot();
    this.world.boot();

    this.add = new Phaser.FakeGameObjectFactory(this);

    this.physics = new Phaser.Physics(this, { 'arcade': true});
    this.physics.startSystem( Phaser.Physics.ARCADE );
}
Phaser.FakeGame.prototype.constructor = Phaser.FakeGame;


Phaser.FakeGame.prototype.setElapsedTime = function(time) {
	this.time.physicsElapsed = time;
}

Phaser.FakeGame.prototype.preUpdate = function() {
    //this.physics.preUpdate();
	this.stage.preUpdate();
}

Phaser.FakeGame.prototype.postUpdate = function() {
	this.stage.postUpdate();
}
