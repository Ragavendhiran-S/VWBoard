const express = require("express");
const app = express();
const server = require("http").createServer(app);
const { Server } = require("socket.io");

const { addUser, getUser, removeUser } = require("./utils/users");

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    socket.on("join_room", (data) => {
        const { userId, roomId } = data;    
        const user = addUser({ userId, roomId, socketId: socket.id });
        socket.join(user.roomId);
        io.to(user.roomId).emit("user_joined", user);
    });
    socket.on("disconnect", () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.roomId).emit("user_left", user);
        }
    });
});


const port = process.env.PORT || 5000;

server.listen(port, () => {
    console.log("Server is running on port 5000");                          
});