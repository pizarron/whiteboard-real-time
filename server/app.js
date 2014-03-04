var io = require('socket.io').listen(9090);

/* Socket Chat */
this.socketChat = io.of("/chat");
this.socketChat.on("connection", function(socket) {
    socket.json.send({"user": "pizarron", "message": "Welcome to pizarron chat!"});
    
    socket.on("message", function(message) {
        socket.json.send(message);
    });

    socket.on("message_to_server", function(message) {
        socket.emit("message_to_client", message);
        message.user = "anonymous";
        socket.broadcast.json.send(message);
    });
});

/* Socket Whiteboard */
this.socketWBoard = io.of("/wboard");
this.socketWBoard.on("connection", function(socket) {
    
});