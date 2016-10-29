Phaser.World = function (game) {

    Phaser.Group.call(this, game, null, '__world', false);

    /**
    * The World has no fixed size, but it does have a bounds outside of which objects are no longer considered as being "in world" and you should use this to clean-up the display list and purge dead objects.
    * By default we set the Bounds to be from 0,0 to Game.width,Game.height. I.e. it will match the size given to the game constructor with 0,0 representing the top-left of the display.
    * However 0,0 is actually the center of the world, and if you rotate or scale the world all of that will happen from 0,0.
    * So if you want to make a game in which the world itself will rotate you should adjust the bounds so that 0,0 is the center point, i.e. set them to -1000,-1000,2000,2000 for a 2000x2000 sized world centered around 0,0.
    * @property {Phaser.Rectangle} bounds - Bound of this world that objects can not escape from.
    */
    this.bounds = new Phaser.Rectangle(0, 0, game.width, game.height);

    /**
    * @property {Phaser.Camera} camera - Camera instance.
    */
    this.camera = null;

    /**
    * @property {boolean} _definedSize - True if the World has been given a specifically defined size (i.e. from a Tilemap or direct in code) or false if it's just matched to the Game dimensions.
    * @readonly
    */
    this._definedSize = false;

    /**
    * @property {number} width - The defined width of the World. Sometimes the bounds needs to grow larger than this (if you resize the game) but this retains the original requested dimension.
    */
    this._width = game.width;

    /**
    * @property {number} height - The defined height of the World. Sometimes the bounds needs to grow larger than this (if you resize the game) but this retains the original requested dimension.
    */
    this._height = game.height;

    this.game.state.onStateChange.add(this.stateChange, this);

};
Phaser.World.prototype = Object.create(Phaser.Group.prototype);
Phaser.World.prototype.constructor = Phaser.World;

/**
* Initialises the game world.
*
* @method Phaser.World#boot
* @protected
*/
Phaser.World.prototype.boot = function () {
    this.game.stage.addChild(this);
};


/**
* Updates the size of this world and sets World.x/y to the given values
* The Camera bounds and Physics bounds (if set) are also updated to match the new World bounds.
*
* @method Phaser.World#setBounds
* @param {number} x - Top left most corner of the world.
* @param {number} y - Top left most corner of the world.
* @param {number} width - New width of the game world in pixels.
* @param {number} height - New height of the game world in pixels.
*/
Phaser.World.prototype.setBounds = function (x, y, width, height) {

    this._definedSize = true;
    this._width = width;
    this._height = height;

    this.bounds.setTo(x, y, width, height);

    this.x = x;
    this.y = y;

    this.game.physics.setBoundsToWorld();

};

/**
* @name Phaser.World#width
* @property {number} width - Gets or sets the current width of the game world. The world can never be smaller than the game (canvas) dimensions.
*/
Object.defineProperty(Phaser.World.prototype, "width", {

    get: function () {
        return this.bounds.width;
    },

    set: function (value) {

        if (value < this.game.width)
        {
            value = this.game.width;
        }

        this.bounds.width = value;
        this._width = value;
        this._definedSize = true;

    }

});

/**
* @name Phaser.World#height
* @property {number} height - Gets or sets the current height of the game world. The world can never be smaller than the game (canvas) dimensions.
*/
Object.defineProperty(Phaser.World.prototype, "height", {

    get: function () {
        return this.bounds.height;
    },

    set: function (value) {

        if (value < this.game.height)
        {
            value = this.game.height;
        }

        this.bounds.height = value;
        this._height = value;
        this._definedSize = true;

    }

});

/**
* @name Phaser.World#centerX
* @property {number} centerX - Gets the X position corresponding to the center point of the world.
* @readonly
*/
Object.defineProperty(Phaser.World.prototype, "centerX", {

    get: function () {
        return this.bounds.halfWidth;
    }

});

/**
* @name Phaser.World#centerY
* @property {number} centerY - Gets the Y position corresponding to the center point of the world.
* @readonly
*/
Object.defineProperty(Phaser.World.prototype, "centerY", {

    get: function () {
        return this.bounds.halfHeight;
    }

});

/**
* @name Phaser.World#randomX
* @property {number} randomX - Gets a random integer which is lesser than or equal to the current width of the game world.
* @readonly
*/
Object.defineProperty(Phaser.World.prototype, "randomX", {

    get: function () {

        if (this.bounds.x < 0)
        {
            return this.game.rnd.between(this.bounds.x, (this.bounds.width - Math.abs(this.bounds.x)));
        }
        else
        {
            return this.game.rnd.between(this.bounds.x, this.bounds.width);
        }

    }

});

/**
* @name Phaser.World#randomY
* @property {number} randomY - Gets a random integer which is lesser than or equal to the current height of the game world.
* @readonly
*/
Object.defineProperty(Phaser.World.prototype, "randomY", {

    get: function () {

        if (this.bounds.y < 0)
        {
            return this.game.rnd.between(this.bounds.y, (this.bounds.height - Math.abs(this.bounds.y)));
        }
        else
        {
            return this.game.rnd.between(this.bounds.y, this.bounds.height);
        }

    }

});
