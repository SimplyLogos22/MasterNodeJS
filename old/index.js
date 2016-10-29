var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});


io.on('connection', function(socket){

  // Executed on connect()
  socket.clientId = Math.floor(Math.random() * 1000);
  console.log("Connection: clientId:" + socket.clientId );


  socket.on('registerRequest', function(msg) {
	  handleRegisterRequest(socket, msg);
  });


  socket.on('chat message', function(msg){
    console.log("Chat message");
    io.emit('chat message', msg);
  });


  socket.on('disconnect', function(msg){
    console.log("DisConnect");
  });
});



function handleRegisterRequest(socket, msg) {
  console.log("HandleRegisterRequest");

  // Send back answer
  var registerClientAnswer = {
    'clientId': socket.clientId,
    'position': {
      'x': 32,
      'y': 32
    },
    'velocity': {
      'x': 0,
      'y': 0
    },
    'chamber': '0'
  }

  // Send answer to client
  socket.emit('registerClientAnswer', registerClientAnswer);

  // Send to all other clients (except sender)
  socket.broadcast.emit('registerClient', registerClientAnswer);
}
