import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';

const port = process.env.PORT || 3000;
const app = express();
const server = http.Server(app);
const io = new SocketIO(server);

let users = [];
let connections = [];

app.get('/', (req,res) => {
  res.sendFile(`${__dirname}/index.html`)
});

server.listen(port, () => {
    console.log('[INFO] Listening on *:' + port);
});

io.on('connection', (socket) => {
  connections.push(socket)
  socket.broadcast.emit('user connected');

  socket.on('disconnect', (data) => {
    users.splice(users.indexOf(socket.username), 1);
    updateUserNames();
    connections.splice(connections.indexOf(socket), 1);
  });

  socket.on('send message', (data) => {
    io.emit('new message', {msg: data});
  });

  socket.on('new user', (data, callback) => {
    callback(true);
    socket.username = data;
    users.push(socket.username)
    updateUserNames();
  });

  function updateUserNames(){
    io.sockets.emit('get users', users)
  }
});
