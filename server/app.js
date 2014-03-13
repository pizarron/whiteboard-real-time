var io = require('socket.io').listen(9090, { log: false });

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
    socket.on('join_room', function(room){
        console.log('Join ' + room);
        socket.join(room);
    });
    socket.on('send_data', function(data){
        console.log('Datas ' + JSON.stringify(data));
        socket.broadcast.to(data.room).emit('receive_datas', data.data);
        //socket.in(data.room).emit('receive_datas', data.data);
    });
    socket.on('leave_room', function(room){
        console.log('Leave ' + room);
        socket.leave(room);
    });
});
