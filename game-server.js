"use strict";

var app = require('./web/app.js');
var Game = require('./game.js');
var Network = require('./network/network.js');
var winston = require('winston');
var fs = require('fs');
var mongodb = require('mongodb');

var server = require('http').createServer(app)
    , url = require('url')
    , WebSocketServer = require('ws').Server
    , wss = new WebSocketServer({ server: server })
    , express = require('express')
    , port = 8080;



var cfg = {
    ssl: false,
    port: 8443,
    ssl_key: 'cert/privkey1.pem',
    ssl_cert: 'cert/cert1.pem'
};


// SSL
if (cfg.ssl) {
    var httpServ = require('https')
    var myServer = httpServ.createServer({
        key: fs.readFileSync( cfg.ssl_key ),
        cert: fs.readFileSync( cfg.ssl_cert ),
    }, app ).listen( cfg.port );
    var wssS = new WebSocketServer( { server: myServer } );
}


/* Game Server
 *
 * setup network
 * dispatch messages from network
 * start main game thread
 *
 */


// Broadcast implementation
wss.broadcast = mybroadcast;

if (cfg.ssl) {
    wssS.broadcast = mybroadcast;
}


function mybroadcast(data) {
    var jsonData = JSON.stringify(data);

    wss.clients.forEach(function each(client) {
        try {
            client.send(jsonData);
        } catch(e) {
            winston.error("Error sending data to client");

            if (client.player) {
                client.player.performDisconnect();
            }
        }
    });

    if (cfg.ssl) {
        wssS.clients.forEach(function each(client) {
            try {
                client.send(jsonData);
            } catch (e) {
                winston.error("Error sending data to client");
                if (client.player) {
                    client.player.performDisconnect();
                }
            }
        });
    }
};


// BroadcastExcept implementation
wss.broadcastExcept = mybroadcastExcept;

if (cfg.ssl) {
    wssS.broadcastExcept = mybroadcastExcept;
}

function mybroadcastExcept(data, id) {
    var jsonData = JSON.stringify(data);

    wss.clients.forEach(function each(client) {
        if (client.clientId != id) {
            try {
                client.send(jsonData);
            } catch(e) {
                winston.error("Error sending data to client: " + id);
                if (client.player) {
                    client.player.performDisconnect();
                }
            }
        }
    });

    if (cfg.ssl) {
        wssS.clients.forEach(function each(client) {
            if (client.clientId != id) {
                try {
                    client.send(jsonData);
                } catch (e) {
                    winston.error("Error sending data to client: " + id);

                    if (client.player) {
                        client.player.performDisconnect();
                    }
                }
            }
        });
    }
};



/* Setup all teh things */
/*
var game = new Game.Game();
var network = new Network.Network(wss, game);

game.setNetwork(network);
app.setGame(game);
*/
var network;

var MongoClient = mongodb.MongoClient;
var mongourl = 'mongodb://localhost/MasterNodeJS';
var mongoDB;
MongoClient.connect(mongourl, function (err, db) {
    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
        console.log('Connection established to', mongourl);

        var game = new Game.Game(db);
        network = new Network.Network(wss, game);

        game.setNetwork(network);
        app.setGame(game);



        // Start teh shizzle
        console.log("rdy.");
        game.updateLoop();

    }
});



if (cfg.ssl) {
    // main WSS handler
    wssS.on('connection', function (ws) {
        ws.on('open', function () {
            console.log("Handle: Connect");
            network.handleNewClient(ws);
        });

        ws.on('close', function () {
            network.handleClientDisconnect(ws);
        });

        ws.on('message', function (message) {
            network.handleMessage(ws, message);
        });
    });
}

// main WS handler
wss.on('connection', function(ws) {
    ws.on('open', function() {
        console.log("Handle: Connect");
        network.handleNewClient(ws);
    });

    ws.on('close', function() {
        network.handleClientDisconnect(ws);
    });

    ws.on('message', function(message) {
        network.handleMessage(ws, message);
    });
});






/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);


/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}
/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}

