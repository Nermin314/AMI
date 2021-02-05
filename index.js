let AsteriskAmi = require('asterisk-ami')
let express = require('express');
let app = express();
let server=require('http').Server(app);
let path = require('path');
let io=require('socket.io')(server);

let ami = new AsteriskAmi( { host: 'localhost', username: 'nermin-ami', password: '123456'} ); 

server.listen(3000,function(err){
  if(err){
    console.log("Error");
  }
  console.log("Listening on http://localhost:3000");
 });


app.use(express.static(__dirname));
app.get('/', function(request, response){
  response.sendFile(__dirname +"/index.html");
});

io.on('connection', function(socket) {

  socket.on('disconnect', function() {
    console.log('Socket disconnected');
  });

  ami.on('ami_data', function(data){
    socket.emit('event',data);
    });

  ami.connect(function(response){
    console.log('connected to the AMI');
    ami.send({Action: 'SIPPeers'}); //check for all Peers 
    setInterval(function(){
    ami.send({action: 'Ping'});
    }, 4000);});
});

process.on('SIGINT', function () {
  ami.disconnect();
  process.exit(0);
});