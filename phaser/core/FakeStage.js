 /////// Stage
    Phaser.Stage =  function(game) {
        this.game = game;
        PIXI.DisplayObjectContainer.call(this);

	this.name = '_stage_root';
	this.exists = true;
//	this.worldTransform = new PIXI.Matrix();
	this.stage = this;
	this.currentRenderOrderID = 0;

    }
    Phaser.Stage.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    Phaser.Stage.prototype.constructor = Phaser.Stage;

    /**
     * This is called automatically after the plugins preUpdate and before the State.update.
     * Most objects have preUpdate methods and it's where initial movement and positioning is done.
     *
     * @method Phaser.Stage#preUpdate
     */
    Phaser.Stage.prototype.preUpdate = function () {

        this.currentRenderOrderID = 0;

        //  This can't loop in reverse, we need the orderID to be in sequence
        for (var i = 0; i < this.children.length; i++)
        {
            this.children[i].preUpdate();
        }
    };

    /**
     * This is called automatically after the State.update, but before particles or plugins update.
     *
     * @method Phaser.Stage#update
     */
    Phaser.Stage.prototype.update = function () {

        var i = this.children.length;

        while (i--)
        {
            this.children[i].update();
        }

    };

    /**
     * This is called automatically before the renderer runs and after the plugins have updated.
     * In postUpdate this is where all the final physics calculatations and object positioning happens.
     * The objects are processed in the order of the display list.
     * The only exception to this is if the camera is following an object, in which case that is updated first.
     *
     * @method Phaser.Stage#postUpdate
     */
    Phaser.Stage.prototype.postUpdate = function () {
        var i = this.children.length;

        while (i--)
        {
            this.children[i].postUpdate();
        }

    };

Phaser.Stage.prototype.boot = function () {

}
