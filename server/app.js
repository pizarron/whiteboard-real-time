var io = require('socket.io').listen(9090);

io.sockets.on('connection', function(socket) {
    socket.send('Welcome to whiteboard!');
});