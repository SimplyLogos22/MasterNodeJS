/*
 * Serve JSON to our AngularJS client
 */

var game;


var chambers = function (req, res) {
    res.json({
        chambers: game.getForWeb(),
    });
}


var playerHistory = function (req, res) {
    game.mongoDB.collection('players', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.json({
                playerHistory: items,
            });
        });
    });
}


var setGame = function(g) {
    game = g;
}

exports.chambers = chambers;
exports.playerHistory = playerHistory;

exports.setGame = setGame;


