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
    /*
    Tanto un profesor como un estudiante lanzan este evento para unirse a un aula (room)
     */
    socket.on('join_room', function(room){
        console.log('Join ' + room);
        socket.join(room);
    });
    /*
     Evento que debe lanzar el profesor para enviar los datos de su pizarra a todos los estudiantes
     que esten en su misma aula (room)

     */
    socket.on('send_data', function(data){
        console.log('Datas ' + JSON.stringify(data));
        /*
             data : {
                  room: 'room del profesor',
                  data: {
                        datos de la pizarra
                  }
             }
         */
        socket.broadcast.to(data.room).emit('receive_datas', data.data);
    });
    /*
     Tanto un profesor como un estudiante lanzan este evento para dejar un aula (room)
     */
    socket.on('leave_room', function(room){
        console.log('Leave ' + room);
        socket.leave(room);
    });
});
