const express = require("express");
const http = require("http");
const app = express();
const { Server } = require("socket.io");
const { PeerServer } = require("peer");
const {addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');
// Create a separate server for PeerServer
const peerServer = PeerServer({
  port: 5001, // Using a separate port
  path: "/",
});

// Create the main server
const server = http.createServer(app);
const io = new Server(server);

// routes
app.get("/", (req, res) => {
  res.send(
      "Code by Ragavendhiran S"
  );
});

let roomIdGlobal, imgURLGlobal;

io.on("connection", (socket) => {
  socket.on("userJoined", (data) => {
    const { name, userId, roomId, host, presenter } = data;
    roomIdGlobal = roomId;
    socket.join(roomId);
    const users = addUser({
      name,
      userId,
      roomId,
      host,
      presenter,
      socketId: socket.id,
    });
    socket.emit("userIsJoined", { success: true, users });
    console.log({ name, userId });
    socket.broadcast.to(roomId).emit("allUsers", users);
    setTimeout(() => {
      socket.broadcast
          .to(roomId)
          .emit("userJoinedMessageBroadcasted", { name, userId, users });
      socket.broadcast.to(roomId).emit("whiteBoardDataResponse", {
        imgURL: imgURLGlobal,
      });
    }, 1000);
  });

  socket.on("whiteboardData", (data) => {
    imgURLGlobal = data;
    socket.broadcast.to(roomIdGlobal).emit("whiteBoardDataResponse", {
      imgURL: data,
    });
  });

  socket.on("message", (data) => {
    const { message } = data;
    const user = getUser(socket.id);
    if (user) {
      socket.broadcast
          .to(roomIdGlobal)
          .emit("messageResponse", { message, name: user.name });
    }
  });
  socket.on("message", ({ message, roomId }) => {
    // Emit the message to the specific room
    socket.to(roomId).emit("messageResponse", { message, name: "Other User" });
  });


  socket.on("disconnect", () => {
    const user = getUser(socket.id);
    if (user) {
      removeUser(socket.id);
      socket.broadcast.to(roomIdGlobal).emit("userLeftMessageBroadcasted", {
        name: user.name,
        userId: user.userId,
      });
    }
  });
});

const port = process.env.PORT || 5000;

server.listen(port, () =>
    console.log("server is running on http://localhost:5000")
);
