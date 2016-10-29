"use strict";

var Utils = require('./../utils.js');


/* Map
 *
 * @constructor
 * @this {Map}
 * @param {Game} the game
 */
function Map(game) {
    this.game = game;

    this.level = undefined;
    this.mapEntities = undefined;   // All tiles in a consecutive list
    this.mapEntitiesInverted = undefined; // All free tiles in a consecutive list
    this.mapEntitiesArr = undefined; // 2 Dim array of the tiles
    this.mapEntitiesArr2 = undefined;

}
Map.prototype.constructor = Map;



module.exports = Map;



/* generateRandomWalkableCoordinates
 *
 *
 * @return {Position} a random position on the map which is walkable
 */
Map.prototype.generateRandomWalkableCoordinates = function() {
    var randomTile = Utils.randomIntFromInterval(0, this.mapEntitiesInverted.length-1);
    //var randomX = Utils.randomIntFromInterval(0, 31);
    //var randomY = Utils.randomIntFromInterval(0, 31);

    var position = {
        //x: this.mapEntitiesInverted[randomTile].x + randomX,
        //y: this.mapEntitiesInverted[randomTile].y + randomY,
        x: this.mapEntitiesInverted[randomTile].x + 16,
        y: this.mapEntitiesInverted[randomTile].y + 16,
    }

    return position;
}



/* parseMap
 *
 * opens the json map file
 * parses the tiles of the map
 * adds the tiles to the game world
 */
Map.prototype.parseMap = function(mapGroup, level) {
    var mapFilename;
    this.level = level;
    if (level == 'level1') {
        mapFilename = 'gamemap2';
    } else if (level == 'level2') {
        mapFilename = 'gamemap3';
    }

    // Loads into this.mapEntities
    this.loadMap(mapFilename);
    this.mergeMap();

    /*
    var fakeSprite;
    for(var n=0; n<this.mapEntities.length; n++) {
        // Anchor is 0.5/0.5, so add half of sprite width/height
        fakeSprite = this.game.add.sprite(
            this.mapEntities[n].x + 16,
            this.mapEntities[n].y + 16,
            32,
            32
        );
        this.game.physics.enable(fakeSprite, Phaser.Physics.ARCADE);
        fakeSprite.myType = "wall";
        fakeSprite.body.collideWorldBounds = true;
        fakeSprite.body.immovable = true;
        mapGroup.add(fakeSprite);
    }*/

    var fakeSprite;
    for(var n=0; n<this.mapEntities.length; n++) {
        // Anchor is 0.5/0.5, so add half of sprite width/height
        fakeSprite = this.game.add.sprite(
            this.mapEntities[n].x + this.mapEntities[n].width / 2,
            this.mapEntities[n].y + this.mapEntities[n].height / 2,
            this.mapEntities[n].width,
            this.mapEntities[n].height
        );
        this.game.physics.enable(fakeSprite, Phaser.Physics.ARCADE);
        fakeSprite.myType = "wall";
        fakeSprite.body.collideWorldBounds = true;
        fakeSprite.body.immovable = true;
        mapGroup.add(fakeSprite);
    }


    console.log("   All loaded");
}



/* mergeMap
 *
 * quite possibly one of the worst functions i've ever written. Dont try to
 * tune it, ever.
 *
 * Merges tiles (size 32x32) into bigger rectangles, so collision detection
 * has a massive amount of lesser work (level2: 38 instead of 975).
 *
 * This works by going to all tiles, starting at top left. It tries to expand
 * the tile as much as possible to the right.
 * After that, it checks the (now very wide) rectangle can be expanded to the bottom.
 *
 * This is a very primitive algorithmn, but works pretty ok with the map
 * layout i have currently.
 */
Map.prototype.mergeMap = function() {
    this.mapEntities = [];

    // go through all tiles in 2d array
    // Start with top left
    for(var n=0; n<(64*64); n++) {
        var x = n % 64;
        var y = Math.floor (n / 64);

        var r = {
            x: x,
            y: y,
            width: 32,
            height: 32,
            arr: {},
        }


        if (this.mapEntitiesArr[x][y] == false) {
            continue;
        }

        // found a used tile
        r.arr[y] = [];
        r.arr[y].push({x: x});
        var lastYidx = y;
        this.mapEntitiesArr[x][y] = false;

        // go as deep right as possible
        var right = 1;
        while(x+right < 64) {
            if ( this.mapEntitiesArr[x+right][y] == true) {
                r.arr[y].push({x: x+right});
                this.mapEntitiesArr[x+right][y] = false;
                right++;
                //console.log("   Extend right");
            } else {
                break;
            }
        }

        // ok, now extend rectangle to bottom if possible
        var b = true;
        while(b) {
            var allOk = true;
            // check if at bottom
            if (lastYidx + 1 >= 64) {
                break;
            }

            // check if complete line below is also occupied
            for (var i = 0; i < r.arr[lastYidx].length; i++) {
                var newX = r.arr[lastYidx][i].x;
                var newY = lastYidx + 1;

                if (this.mapEntitiesArr[newX][newY] == false) {
                    allOk = false;
                    break;
                } else {
                }
            }

            // if yes, merge it
            if (allOk) {
                r.arr[lastYidx + 1] = [];
                for (var i = 0; i < r.arr[lastYidx].length; i++) {
                    var newX = r.arr[lastYidx][i].x;
                    var newY = lastYidx + 1;

                    this.mapEntitiesArr[newX][newY] = false;
                    r.arr[newY].push({x: newX});
                }

                lastYidx++;
                if (lastYidx > 64) {
                    b = false;
                }
            } else {
                b = false;
            }
        }

        // Output
        // console.log("Rectangle elemtns: ")
        // for(var yy in r.arr) {
        //    for(var xx in r.arr[yy]) {
        //        console.log(" Y: " + yy + "  x: " + r.arr[yy][xx].x);
        //    }
        //}

        // Converting
        var rect = {
            width: 0,
            height: 0,
        }

        var height = 0;
        for(var yy in r.arr) {
            height++;
        }
        rect.height = height;

        var width = 0;
        for(var xx in r.arr[yy]) {
            width++;
        }
        rect.width = width;

//        console.log("N: ");
//        console.log("   X: " + r.x + "  Y: " + r.y);
//        console.log("   W: " + rect.width + "  H: " + rect.height);

        var res = {
            x: r.x * 32,
            y: r.y * 32,
            width: rect.width * 32,
            height: rect.height * 32,
        }
        this.mapEntities.push(res);
    }

    console.log("   Tile Elements optimized: " + this.mapEntities.length);
}



/* Load map
 *
 * Loads a map exported by the tiled editor as json (not zipped)
 *
 * It has to have the following properties:
 * - Collision layer needs to be named "Houses"
 *
 */
Map.prototype.loadMap = function(mapName) {
    console.log("Loading map");
    console.log("   Name: " +  mapName);

    var map = require('../maps/' + mapName);
    var mapElements = [];
    var mapElementsInverted = [];

    var mapElementsArr = new Array(64);
    for(var n=0; n<64; n++) {
        mapElementsArr[n] = new Array(64);
    }

    var mapElementsArr2 = [];
    for(var n=0; n<64; n++) {
        //mapElementsArr2[n] = [];
        mapElementsArr2.push([]);
    }

    // Find the correct layer
    var layer = map.layers[0];
    for(var n=0; n<map.layers.length; n++) {
        if (map.layers[n].name == "Houses") {
            layer = map.layers[n];
        }
    }

    // Layer stats
    var width = layer.width;
    var height = layer.height;
    var size = map.tilewidth;

    // Extract the tiles
    var x, y, posx, posy;
    for(var n=0; n < width*height; n++) {
        x = n % width;
        y = Math.floor (n / width);

        posx = x * size;
        posy = y * size;

        var element = {
            x: posx,
            y: posy,
        }

        if (layer.data[n] != 0) {
            mapElementsArr[x][y] = true;
            mapElementsArr2[y][x] = 1;
            mapElements.push(element);
        } else {
            mapElementsArr[x][y] = false;
            mapElementsArr2[y][x] = 0;
            mapElementsInverted.push(element);
        }
    }

    console.log("   Size: " + (width * size) + " / " + (height * size));
    console.log("   Tile Elements: " + mapElements.length);

    this.mapEntities = mapElements;
    this.mapEntitiesInverted = mapElementsInverted;
    this.mapEntitiesArr = mapElementsArr;
    this.mapEntitiesArr2 = mapElementsArr2;


    /*
    for (var i = 0; i < mapElementsArr.length; i++)
        this.mapEntitiesArr2[i] = mapElementsArr[i].slice();
        */

    return mapElements;
}



Map.prototype.getLevel = function() {
    return this.level;
}

