"use strict"

var http = require('http');
var WebSocketServer = require('websocket').server;
var connections = {};

function log(text) {
    var time = new Date();
    console.log("[" + time.toLocaleTimeString() + "]" + text);
}

var httpServer = http.createServer(function (request, response) {
    log("Received request for " + request.url);
    response.writeHead(404);
    response.end();
});


httpServer.listen(6503, function () {
    log("Server is listening on port 6503");
});


var wsServer = new WebSocketServer({
    httpServer: httpServer,
    autoAcceptConnections: false
});

var nextId = 0;

wsServer.on('request', function (request) {

    //Get a connection
    var connection = request.accept("json", request.origin);

    log("Connection accepted from " + connection.remoteAddress + ".");

    connection.on('message', function (message) {
        if (message.type === 'utf8')
            log("Message Received: " + message.utf8Data);

        var msg = JSON.parse(message.utf8Data);
        switch (msg.type) {
            case 'registration':
                connections[msg.id] = connection;
                break;
            case "connection-offer":
            case "connection-answer":
                connections[msg.target].sendUTF(message.utf8Data);
                break;
        }

    })

    connection.on('close', function (reason, description) {
        log("Connection closed for " + connection.remoteAddress + "(" + reason + ")");
    })
});


