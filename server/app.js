var io = require('socket.io').listen(9090, { log: false });
/* Socket Chat */
this.socketChat = io.of("/chat");
this.socketChat.on("connection", function(socket) {
    socket.on('join_chat_room', function(room){
        socket.join(room);
    });
    /*
        message: {
            room: 'aula al cual pertenece (room)',
            user: 'Nombre de usuario (nick)',
            message: 'Mensaje'
        }
     */
    socket.on('send_message', function(message){
        socket.broadcast.to(message.room).emit('receive_message', { user: message.user, message: message.message});
    });
    socket.on('leave_chat_room', function(room){
        socket.leave(room);
    });
});

/* Socket Whiteboard */
this.socketWBoard = io.of("/wboard");
this.socketWBoard.on("connection", function(socket) {
    /*
    Tanto un profesor como un estudiante lanzan este evento para unirse a un aula (room)
     */
    socket.on('join_room', function(room){
        socket.join(room);
        console.log('Socket: ' + socket.id + ' joined to room: ' + room);
    });
    /*
     Evento que debe lanzar el profesor para enviar los datos de su pizarra a todos los estudiantes
     que esten en su misma aula (room)

     data : {
         room: 'room del profesor',
         data: {
            datos de la pizarra
         }
     }
     */
    socket.on('send_data', function(data){
        if (data.room in rooms) {
            console.log('Datas ' + JSON.stringify(data));
            socket.broadcast.to(data.room).emit('receive_datas', data.data);
        }
    });
    /*
     Tanto un profesor como un estudiante lanzan este evento para dejar un aula (room)
     */
    socket.on('leave_room', function(room){
        console.log('Leave ' + room);
    });
});
