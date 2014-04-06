// configurations
function myLog(message) {
    var a  = new Date();
    console.log(a.toString() + " >>> " + message);
}
var dev_config = {
    port: 9090,
    enable_log: false,
    uriget: 'http://10.0.0.5/message/getmessages',
    uripost: 'http://10.0.0.5/message/insert'
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
    myLog('send message to Server');
    try {
        request({
            uri: dev_config.uripost,
            method: 'POST',
            timeout: 10000,
            followRedirect: true,
            maxRedirects: 10,
            form: {
                'courseClassId': parseInt(message.room, 10),
                'username': message.user,
                'message': message.message
            }
        }, function(error, response, body) {
            if(error) {
                myLog(error);
            }else{
                myLog(body);
            }
        });
    } catch(e) {
        myLog('Sending to rest api POST error ... puto');
    }
}
/* Socket Chat */
this.socketChat = io.of("/chat");
this.socketChat.on("connection", function(socket) {
    socket.on('join_chat_room', function(room){
        myLog('joined to ' + room);
        request(dev_config.uriget + '?courseClassId=' + parseInt(room, 10), function(error, response, body){
            if (error) {
                myLog(error);
            }else{
                myLog(body);
                socket.emit('receive_message', JSON.parse(body));
            }
        });
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
        myLog(JSON.stringify(message));
        SendToServer(message);
        socket.broadcast.to(message.room).emit('receive_message', [ { user: message.user, message: message.message} ]);
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
    var handshake = socket.handshake;
    if (handshake) {
        var ipaddr = handshake.address;
        myLog('[+] Connected from IP: ' + ipaddr.address);
    }
    socket.on('join_room', function(info){
        myLog(JSON.stringify(info));
        socket.join(info.room);
        socket.role = info.role;
        if (info.role == 'teacher') {
            rooms[info.room] = {
                datas : [],
                teacherSocket : socket
            };
            myLog('Socket: ' + socket.id + ' joined to room: ' + info.room + 'as teacher');
            myLog('Created array for room: '+  info.room);
        }else if (info.role == 'student') {
            if (info.room in rooms){
                myLog('Socket: ' + socket.id + ' joined to room: ' + info.room + 'as student');
                myLog('Sending previous data: ' + JSON.stringify(rooms[info.room].datas));
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
            myLog('Datas ' + JSON.stringify(data));
            if (data.clear){
                delete rooms[data.room].datas;
                rooms[data.room].datas = [];
                socket.broadcast.to(data.room).emit('clear_data');
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
        if (socket.role == 'teacher') {
            socket.broadcast.to(room).emit('class_finish');
        }
        socket.leave(room);
        myLog('Leave ' + room);
    });
});
myLog('Server start ...');
