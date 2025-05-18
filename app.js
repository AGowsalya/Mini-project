const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static HTML/CSS/JS from memory
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>🎵 Music Room Chat</title>
  <style>
    body { font-family: Arial; text-align: center; background: #f4f4f4; margin: 0; padding: 2em; }
    h1 { color: #333; }
    audio { margin: 20px 0; }
    #chat { max-width: 500px; margin: 0 auto; }
    ul { list-style: none; padding: 0; height: 150px; overflow-y: auto; background: #fff; border: 1px solid #ccc; margin-bottom: 10px; }
    li { padding: 5px; text-align: left; }
    input { padding: 10px; width: 70%; }
    button { padding: 10px 15px; }
  </style>
</head>
<body>
  <h1>🎵 Music Room</h1>
  <audio id="music" controls>
    <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mp3">
    Your browser does not support audio.
  </audio>

  <div id="chat">
    <ul id="messages"></ul>
    <input id="msgInput" placeholder="Type a message..." />
    <button onclick="sendMessage()">Send</button>
  </div>

  <script src="/socket.io/socket.io.js"></script>
  <script>
    const socket = io();
    const audio = document.getElementById('music');
    const input = document.getElementById('msgInput');
    const messages = document.getElementById('messages');

    audio.onplay = () => socket.emit('music control', 'play');
    audio.onpause = () => socket.emit('music control', 'pause');

    socket.on('music control', action => {
      if (action === 'play') audio.play();
      if (action === 'pause') audio.pause();
    });

    function sendMessage() {
      const msg = input.value.trim();
      if (msg) {
        socket.emit('chat message', msg);
        input.value = '';
      }
    }

    socket.on('chat message', msg => {
      const li = document.createElement('li');
      li.textContent = msg;
      messages.appendChild(li);
      messages.scrollTop = messages.scrollHeight;
    });
  </script>
</body>
</html>
  `);
});

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });

  socket.on("music control", (action) => {
    socket.broadcast.emit("music control", action);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
