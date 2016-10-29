Phaser.FakeGameObjectFactory = function (game) {
    this.game = game;
    this.world = this.game.world;
}
Phaser.FakeGameObjectFactory.constructor = Phaser.FakeGameObjectFactory;

Phaser.FakeGameObjectFactory.prototype = {
    sprite: function (x, y, width, height) {
        //sprite: function (x, y, key, frame, group) {
        var key = undefined;
        var frame = undefined;
        var group = this.world;

        var s = group.create(x, y, key, frame);

        s.width = width;
        s.height = height;

        return s;
    },
}

