var io = require('socket.io').listen(9090);

/* Socket Chat */
this.socketChat = io.of("/chat");
this.socketChat.on("connection", function(socket) {
    
});

/* Socket Whiteboard */
this.socketWBoard = io.of("/wboard");
this.socketWBoard.on("connection", function(socket) {
    socket.on("set_user", function(user) {
        socket.set("user", user, function() {
            socket.emit("user_on", user);
            var message = {"content": "Welcome " + user.name + "!"};
            socket.send(message);
        });
    });
    socket.on("join_course_class", function(courseClass) {
    	socket.get("user", function(error, user) {
    		socket.join(courseClass.id);
    		socket.room = courseClass.id;
    		socket.in(courseClass.id).broadcast.emit("user_entered", user);
    	});
    });
    socket.on("message", function(message) {
    	socket.in(socket.room).broadcast.send(message);
    	socket.send(message);
    });
});