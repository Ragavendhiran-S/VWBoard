import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Peer from "peerjs";

const JoinRoomForm = ({ uuid, socket, setUser, setMyPeer }) => {
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");

  const navigate = useNavigate();

  const handleRoomJoin = (e) => {
    e.preventDefault();

    // open peer connection with socket.io server
    const myPeer = new Peer(undefined, {
      host: "/",
      port: 5001,
      path: "/",
      secure: false,
    });

    setMyPeer(myPeer);

    myPeer.on("open", (id) => {
      const roomData = {
        name,
        roomId,
        userId: id,
        host: false,
        presenter: false,
      };
      setUser(roomData);
      navigate(`/${roomId}`);
      socket.emit("userJoined", roomData);
    });

    myPeer.on("error", (err) => {
      console.log("peer connection error", err);
      myPeer.reconnect();
    });
  };

  return (
    <form
      className="w-full max-w-md mx-auto p-6 bg-white shadow-md rounded-lg space-y-4 min-w-96"
      onSubmit={handleRoomJoin}
    >
      <div className="flex flex-col">
        <label htmlFor="name" className="text-gray-700 font-semibold mb-1">
          User Name
        </label>
        <input
          type="text"
          id="name"
          placeholder="Enter your name"
          className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            id="room-id"
            placeholder="Enter Room ID"
            className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-center">
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white font-semibold rounded hover:bg-green-600 transition duration-200 min-w-40 max-w-45"
        >
          Join Room
        </button>
      </div>
    </form>
  );
};

export default JoinRoomForm;
