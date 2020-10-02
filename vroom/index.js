const express = require('express');
const app = express();
const server = require('http').Server(app);
const port = process.env.PORT || 3000;
const io = require('socket.io')(server);
const cors = require('cors');
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
const { v4: uuidV4 } = require('uuid')

app.use('/peerjs', peerServer);
app.use(cors());
app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', '*');
  res.append('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Expose-Headers', '*')
  next();
});

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req,res)=>{
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/new', (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get('/join', (req,res)=>{
  res.sendFile(__dirname + '/views/join.html');
});

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });
});

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);
    socket.on('message', (message) => {
      io.to(roomId).emit('createMessage', message);
    }); 
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId);
    });
  });
});

server.listen(port, ()=>{
  console.log('Connected on port', port);
});