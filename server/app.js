// configurations
var dev_config = {
    port: 9090,
    enable_log: false,
    uri: 'http://localhost:57198/home/submitdata'
};
var ultimate_config = {
    port: 80,
    enable_log: false,
    uri: 'http://sample.com'
};
// requires
var request = require('request');
var io = require('socket.io').listen(dev_config.port, { log: dev_config.enable_log });
function SendToServer(message) {
    console.log('send message to Server');
    request({
        uri: dev_config.uri,
        method: 'POST',
        timeout: 10000,
        followRedirect: true,
        maxRedirects: 10,
        form: {
            'room': message.room,
            'user': message.user,
            'message': message.message
        }
    }, function(error, response, body) {
        if(error) {
            console.log(error);
        }else{
            console.log(body);
        }
    });
};
/* Socket Chat */
this.socketChat = io.of("/chat");
this.socketChat.on("connection", function(socket) {
    socket.on('join_chat_room', function(room){
        console.log('joined to ' + room);
        socket.join(room);
    });
    /*
        message: {
            room: 'aula al cual pertenece (room)',
            user: 'Nombre de usuario (nick)',
            message: 'Mensaje'
        }
     */
    socket.on('send_message', function(message) {
        console.log(JSON.stringify(message));
        SendToServer(message);
        socket.broadcast.to(message.room).emit('receive_message', { user: message.user, message: message.message});
    });
    socket.on('leave_chat_room', function(room){
        socket.leave(room);
    });
});

/* Socket Whiteboard */
var rooms = {};
this.socketWBoard = io.of("/wboard");
this.socketWBoard.on("connection", function(socket) {
    /*
    Tanto un profesor como un estudiante lanzan este evento para unirse a un aula (room)
        info {
            room: "aula a la que se quiere unir",
            role: "Puede ser 'student' o 'teacher'"
        }
     */
    socket.on('join_room', function(info){
        console.log(JSON.stringify(info));
        socket.join(info.room);
        if (info.role == 'teacher') {
            rooms[info.room] = {
                datas : new Array(),
                teacherSocket : socket 
            } 
            console.log('Socket: ' + socket.id + ' joined to room: ' + info.room + 'as teacher');
            console.log('Created array for room: '+  info.room);
        }else if (info.role == 'student') {
            if (info.room in rooms){
                console.log('Socket: ' + socket.id + ' joined to room: ' + info.room + 'as student');
                console.log('Sending previous data: ' + JSON.stringify(rooms[info.room].datas));
                socket.emit('receive_datas', rooms[info.room].datas);
            }

        }
    });
    /*
     Evento que debe lanzar el profesor para enviar los datos de su pizarra a todos los estudiantes
     que esten en su misma aula (room)

     data : {
         room: 'room del profesor',
         clear: 'borra los datos previos', 
         data: {
            datos de la pizarra
         }
     }
     */
    socket.on('send_data', function(data){
        if (data.room in rooms) {
            console.log('Datas ' + JSON.stringify(data));
            if (data.clear){
                delete rooms[data.room].datas;
                rooms[data.room].datas = new Array();
                socket.broadcast.to(data.room).emit('receive_datas', null);
            }else{
                rooms[data.room].datas.push(data.data);
                // Save de points to the room            
                socket.broadcast.to(data.room).emit('receive_datas', [data.data]);
            }
        }
    });
    /*
     Tanto un profesor como un estudiante lanzan este evento para dejar un aula (room)
     */
    socket.on('leave_room', function(room) {
        socket.leave(room);
        console.log('Leave ' + room);
    });
});
console.log('Server start ...');
