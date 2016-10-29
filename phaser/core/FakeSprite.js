

Phaser.Sprite = function(game, x, y, key, frame) {
    this.game = game;
    this.anchor = {
        x: 0.5,
        y: 0.5,
    };

	this.fakeSpriteHeight = 32;
	this.fakeSpriteWidth = 32;

    this.exists = true;
    this.body = null;
    this.game = game;
    this.world = game.world;

    this.physicsType = Phaser.SPRITE;
    this.type = Phaser.SPRITE;
    PIXI.DisplayObjectContainer.call(this);
    Phaser.Component.Core.init.call(this, game, x, y, key, frame);
}


Phaser.Sprite.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Phaser.Sprite.prototype.constructor = Phaser.Sprite;


Phaser.Sprite.prototype.respawnMe = function(x, y) {
    this.position.x = x;
    this.position.y = y;

    if (this.body) {
        if (this.body.moves) {
            this.body.fresh = true;
        }
    }
}


/**
 * The width of the sprite, setting this will actually modify the scale to achieve the value set
 *
 * @property width
 * @type Number
 */
Object.defineProperty(Phaser.Sprite.prototype, 'width', {

    get: function() {
        return this.scale.x * this.fakeSpriteWidth;
    },

    set: function(value) {
        this.scale.x = value / this.fakeSpriteWidth;
        this._width = value;
    }

});

/**
 * The height of the sprite, setting this will actually modify the scale to achieve the value set
 *
 * @property height
 * @type Number
 */
Object.defineProperty(Phaser.Sprite.prototype, 'height', {

    get: function() {
        return  this.scale.y * this.fakeSpriteHeight;
    },

    set: function(value) {
        this.scale.y = value / this.fakeSpriteHeight;
        this._height = value;
    }

});




Phaser.Component.Core.install.call(Phaser.Sprite.prototype, [
    'PhysicsBody',
    'LifeSpan',
]);
Phaser.Sprite.prototype.preUpdatePhysics = Phaser.Component.PhysicsBody.preUpdate;
Phaser.Sprite.prototype.preUpdateLifeSpan = Phaser.Component.LifeSpan.preUpdate;
Phaser.Sprite.prototype.preUpdateInWorld = Phaser.Component.InWorld.preUpdate;
Phaser.Sprite.prototype.preUpdateCore = Phaser.Component.Core.preUpdate;



Phaser.Sprite.prototype.preUpdate = function() {

    if (!this.preUpdatePhysics() || !this.preUpdateLifeSpan() || !this.preUpdateInWorld())
    {
        return false;
    }

    return this.preUpdateCore();

};


/**
 * Returns the bounds of the Sprite as a rectangle. The bounds calculation takes the worldTransform into account.
 *
 * @method getBounds
 * @param matrix {Matrix} the transformation matrix of the sprite
 * @return {Rectangle} the framing rectangle
 */
Phaser.Sprite.prototype.getBounds = function(matrix)
{
    var width = this.texture.frame.width;
    var height = this.texture.frame.height;

    var w0 = width * (1-this.anchor.x);
    var w1 = width * -this.anchor.x;

    var h0 = height * (1-this.anchor.y);
    var h1 = height * -this.anchor.y;

    var worldTransform = matrix || this.worldTransform;

    var a = worldTransform.a;
    var b = worldTransform.b;
    var c = worldTransform.c;
    var d = worldTransform.d;
    var tx = worldTransform.tx;
    var ty = worldTransform.ty;

    var maxX = -Infinity;
    var maxY = -Infinity;

    var minX = Infinity;
    var minY = Infinity;

    if (b === 0 && c === 0)
    {
        // scale may be negative!
        if (a < 0)
        {
            a *= -1;
            var temp = w0;
            w0 = -w1;
            w1 = -temp;
        }

        if (d < 0)
        {
            d *= -1;
            var temp = h0;
            h0 = -h1;
            h1 = -temp;
        }

        // this means there is no rotation going on right? RIGHT?
        // if thats the case then we can avoid checking the bound values! yay
        minX = a * w1 + tx;
        maxX = a * w0 + tx;
        minY = d * h1 + ty;
        maxY = d * h0 + ty;
    }
    else
    {
        var x1 = a * w1 + c * h1 + tx;
        var y1 = d * h1 + b * w1 + ty;

        var x2 = a * w0 + c * h1 + tx;
        var y2 = d * h1 + b * w0 + ty;

        var x3 = a * w0 + c * h0 + tx;
        var y3 = d * h0 + b * w0 + ty;

        var x4 =  a * w1 + c * h0 + tx;
        var y4 =  d * h0 + b * w1 + ty;

        minX = x1 < minX ? x1 : minX;
        minX = x2 < minX ? x2 : minX;
        minX = x3 < minX ? x3 : minX;
        minX = x4 < minX ? x4 : minX;

        minY = y1 < minY ? y1 : minY;
        minY = y2 < minY ? y2 : minY;
        minY = y3 < minY ? y3 : minY;
        minY = y4 < minY ? y4 : minY;

        maxX = x1 > maxX ? x1 : maxX;
        maxX = x2 > maxX ? x2 : maxX;
        maxX = x3 > maxX ? x3 : maxX;
        maxX = x4 > maxX ? x4 : maxX;

        maxY = y1 > maxY ? y1 : maxY;
        maxY = y2 > maxY ? y2 : maxY;
        maxY = y3 > maxY ? y3 : maxY;
        maxY = y4 > maxY ? y4 : maxY;
    }

    var bounds = this._bounds;

    bounds.x = minX;
    bounds.width = maxX - minX;

    bounds.y = minY;
    bounds.height = maxY - minY;

    // store a reference so that if this function gets called again in the render cycle we do not have to recalculate
    this._currentBounds = bounds;

    return bounds;
};