var io = require('socket.io').listen(9090);

/* Socket Chat */
this.socketChat = io.of("/chat");
this.socketChat.on("connection", function(socket) {
    socket.on("set_user", function(user) {
        socket.set('user', user, function() {
            socket.emit("user_on", user);
        });
    });
});

/* Socket Whiteboard */
this.socketWBoard = io.of("/wboard");
this.socketChat.on("connection", function(socket) {
    socket.send("Welcome to whiteboard");
});