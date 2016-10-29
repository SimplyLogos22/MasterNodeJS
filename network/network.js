"use strict";

var Utils = require('./../utils.js');
var uuid = require('node-uuid');
var winston = require('winston');

/* Network.js
 *
 * Handles incoming network messages
 * - dispatches it to other clients
 * - calls chambers
 * - calls player 
 *
 */
function Network(wss, game) {
    this.wss = wss;
    this.game = game;

    this.clientId = 0;
}

module.exports = {
    Network: Network
};



// Network message dispatcher
Network.prototype.handleMessage = function(ws, message) {
	var msg = JSON.parse(message);

    if (! 'player' in ws || ! 'chamber' in ws) {
        winston.error("Websocket without player object.")
    }

    if (msg.type == "registerRequest") {
    	this.handleMessageRegisterRequest(ws, msg);
    } else if (msg.type == "clientKeysRequest") {
        this.handleClientKeysRequest(ws, msg.data);
    } else if (msg.type == "keyPressEvent") {
        this.handleKeyPressEvent(ws, msg.data);
    } else if (msg.type == "keyReleaseEvent") {
        this.handleKeyReleaseEvent(ws, msg.data);
    } else if (msg.type == "fireEvent") {
        this.handleFireEvent(ws, msg.data);
    } else if (msg.type == "playerState") {
        this.handlePlayerStateEvent(ws, msg.data);
    } else if (msg.type == "leaveRequest") {
        this.handleLeaveRequest(ws, msg.data);
    } else if (msg.type == "pong") {
        this.handlePong(ws, msg.data);

    } else if (msg.type == "chatMessage") {
        this.handleChatMessage(ws, msg);
    } else {
        winston.error("Uncatched Broadcast: " + message);
        msg.data.clientId = ws.clientId;
    	this.wss.broadcastExcept( msg, ws.clientId);
    }
}



// Called upon client connect
Network.prototype.handleNewClient = function(ws) {
    winston.debug("Handle: Connect");
}



Network.prototype.handleChatMessage = function(ws, msg) {
    msg.data.clientId = ws.clientId;
    msg.data.userName = ws.player.userName;
    this.wss.broadcast(msg);
}



// Called upon client disconnect
Network.prototype.handleClientDisconnect = function(ws) {
    // Remove player from chamber
    if (ws.chamber != undefined) {
        ws.chamber.removePlayer(ws.clientId);
    } else {
        winston.error("Socket wanted to disconnect even though no player exists.")
    }
}



/* handleMessageRegisterRequest
 *
 * Called when client registers himself, which is sending his username etc
 * for the first time in the connection.
 *
 * We select a chamber for him, create a player object, and send back
 * all necessary information so he can spawn (location, health etc) in a
 * registerAnswer.
 */
Network.prototype.handleMessageRegisterRequest = function(ws, registerRequestData) {
    // Data from registerRequest
    var userName = registerRequestData.data.userName;

    // generate a client id (cryptographically strong)
    var clientId = uuid.v4();

    // get a chamber
    var chamber = this.game.getChamberForNewPlayer();

    // create a player
    var player = chamber.createPlayer(userName, clientId, ws);

    // Populate web socket object
    ws.clientId = clientId;
    ws.player = player;

	// Answer the client
	var regAns = {
        type: "registerAnswer",
        data: {
            player: player.getForNetwork(),
  		    chamber: chamber.getName(),
            level: chamber.map.getLevel(),
  		    powerups: chamber.powerupGroup.getAllAsArrayForNetwork(),
            zombies: chamber.zombieGroup.getAllAsArrayForNetwork(),
            enemies: chamber.getAllPlayersAsArrayNetworkExcept(clientId),
        }
	}
    ws.send( JSON.stringify(regAns) );

	// Broadcast to all others
	var regClient = {
        'type': "registerClient",
        'data': {
            'player': player.getForNetwork()
        }
	}
	this.wss.broadcastExcept( regClient, ws.clientId);
}



Network.prototype.handleKeyPressEvent = function(ws, data) {
    if (ws.player != undefined) {
        ws.player.playerInput.handleKeyPress(data);
    }

    data.clientId = ws.clientId;
    var forward = {
        type: "keyPressEvent",
        data: data,
    }
    this.wss.broadcastExcept(forward, ws.clientId);
}



Network.prototype.sendKeyPressEvent = function(data) {
    var forward = {
        type: "keyPressEvent",
        data: data,
    }
    this.wss.broadcast(forward);
}



Network.prototype.handleKeyReleaseEvent = function(ws, data) {
    if (ws.player != undefined) {
        ws.player.playerInput.handleKeyRelease(data);
    }

    data.clientId = ws.clientId;
    var forward = {
        type: "keyReleaseEvent",
        data: data,
    }
    this.wss.broadcastExcept(forward, ws.clientId);
}



Network.prototype.sendKeyReleaseEvent = function(data) {
    var forward = {
        type: "keyReleaseEvent",
        data: data,
    }
    this.wss.broadcast(forward);
}




/* handleFireEvent
 *
 * {
 *   weaponType: 'SingleBullet' / 'Barrier' / 'Shield' / ...
 *   destination: { x: , y: } // Optional
 *
 * }
 *
 */
Network.prototype.handleFireEvent = function(ws, data) {
    data.clientId = ws.clientId;
    var fireEvent = {
        'type': "fireEvent",
        'data': data
    }

    if (ws.player != undefined) {
        ws.player.handleFireEvent(data);
    } else {
        winston.error("FireEvent even though no player exists.")
    }
    this.wss.broadcastExcept(fireEvent, ws.clientId);
}


Network.prototype.handlePong = function(ws, data) {
    if (ws.player != undefined) {
        ws.player.handlePong(data);
    } else {
        winston.error("Pong even though no player exists.")
    }
}



Network.prototype.handleLeaveRequest = function(ws, data) {
    if ('player' in ws) {
        ws.player.performDisconnect();
    } else {
        winston.error("LeaveEvent even though no player exists.")
    }
}



/* handlePlayerStateEvent
 *
 * {
 *   playerState: 'wantRespawn' /
 * }
 *
 */
Network.prototype.handlePlayerStateEvent = function(ws, data) {
    if (! 'playerState' in data) {
        winston.error("handlePlayerStateEvent: invalid data");
        return;
    }

    ws.player.playerState.handlePlayerStateEvent(data);
}




/*** Send ***/


Network.prototype.sendPlayerStatsUpdate = function(data) {
    var statsEvent = {
        'type': 'playerStatsUpdate',
        'data': data,
    }
    this.wss.broadcast(statsEvent);
}



Network.prototype.sendUpdatePlayerStateEvent = function(playerState) {
    var state = {
        type: 'playerState',
        data: playerState,
    }
    this.wss.broadcast(state);
}



Network.prototype.sendChamberStats = function(chamberStats) {
    // Send to others
    var stats = {
        type: 'chamberStats',
        data: chamberStats,
    }
    this.wss.broadcast(stats);
}


Network.prototype.sendRemoveEntityEvent = function(removeEntity) {
    var stats = {
        type: 'removeEntity',
        data: removeEntity,
    }
    this.wss.broadcast(stats);
}


Network.prototype.sendAddEntityEvent = function(addEntity) {
    var stats = {
        type: 'addEntity',
        data: addEntity,
    }
    this.wss.broadcast(stats);
}


Network.prototype.sendPing = function(ws, ping) {
    var stats = {
        type: 'ping',
        data: ping,
    }
    try {
        ws.send( JSON.stringify(stats) );
    } catch(e) {
        winston.error("Error sending data to client");
        if (ws.player) {
            ws.player.performDisconnect();
        }
    }
}


