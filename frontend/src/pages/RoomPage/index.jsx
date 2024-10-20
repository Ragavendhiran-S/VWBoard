import { useState, useRef, useEffect } from "react";
import "./index.css";
import PropTypes from "prop-types";
import WhiteBoard from "../../components/WhiteBoard";
import Chat from "../../components/Chatbar";

const RoomPage = ({
  addVideoStream, videoGrid, user, myPeer, setPeers, socket, users, setUsers, connectToNewUser
}) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("black");
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([]);
  const [openedUserTab, setOpenedUserTab] = useState(false);
  const [openedChatTab, setOpenedChatTab] = useState(false);
  const [stream, setStream] = useState(null);

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    setElements([]);
    setHistory([]); // Clear history when clearing the canvas
  };

  const undo = () => {
    if (elements.length === 0) return; // No elements to undo
    const lastElement = elements[elements.length - 1];
    setHistory((prevHistory) => [...prevHistory, lastElement]);
    setElements((prevElements) => prevElements.slice(0, prevElements.length - 1));
  };

  const redo = () => {
    if (history.length === 0) return; // No history to redo
    const lastElement = history[history.length - 1];
    setElements((prevElements) => [...prevElements, lastElement]);
    setHistory((prevHistory) => prevHistory.slice(0, prevHistory.length - 1));
  };

  const addUserVideoStream = async (p, call, div, video) => {
    p.innerText = "Other User";
    div.append(p);
    call.on("stream", (userVideoStream) => {
      addVideoStream(div, video, userVideoStream);
    });
  };

  useEffect(() => {
    // Get user media stream when component mounts
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        const div = document.createElement("div");
        div.id = user.userId;
        const p = document.createElement("p");
        p.style.color = "white";
        p.innerText = user.name;
        div.append(p);
        const myVideo = document.createElement("video");
        addVideoStream(div, myVideo, stream);

        // Listen for incoming calls
        myPeer.on("call", (call) => {
          call.answer(stream);
          const div = document.createElement("div");
          div.id = call.peer;
          const video = document.createElement("video");
          const p = document.createElement("p");
          addUserVideoStream(p, call, div, video);
        });
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
      });

    // Cleanup stream when the component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [myPeer, user]);

  useEffect(() => {
    // Handle user joined event
    socket.on("userJoinedMessageBroadcasted", (data) => {
      setUsers(data.users);
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          console.log(`${data.name} ${data.userId} joined the room`);
          connectToNewUser(data.userId, data.name, stream);
        })
        .catch((error) => {
          console.error("Error accessing media devices:", error);
        });
    });

    // Cleanup socket listener on unmount
    return () => {
      socket.off("userJoinedMessageBroadcasted");
    };
  }, [socket, connectToNewUser]);

  const stopStreamAndDisconnect = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop()); // Stop all video/audio tracks
    }
    socket.emit("userDisconnected", user.userId);
  };

  useEffect(() => {
    // Listen for tab/window close event
    const handleBeforeUnload = (event) => {
      stopStreamAndDisconnect();
      event.returnValue = ''; // This triggers the confirmation dialog
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [stream, user, socket]);

  return (
    <div className="row">
      <button
        type="button"
        className="bg-gray-800 text-white rounded"
        style={{
          display: "block",
          position: "absolute",
          top: "5%",
          left: "3%",
          height: "40px",
          width: "100px",
        }}
        onClick={() => setOpenedUserTab(true)}
      >
        Users
      </button>
      <button
        type="button"
        className="bg-blue-600 text-white rounded"
        style={{
          display: "block",
          position: "absolute",
          top: "5%",
          left: "10%",
          height: "40px",
          width: "100px",
        }}
        onClick={() => setOpenedChatTab(true)}
      >
        Chats
      </button>

      {openedUserTab && (
        <div
          className="fixed top-0 h-full bg-gray-800 text-white"
          style={{ width: "250px", left: "0%", zIndex: 1000 }}
        >
          <button
            type="button"
            onClick={() => setOpenedUserTab(false)}
            className="bg-red-500 text-white px-4 py-2 absolute top-4 right-4 rounded-md"
          >
            Close
          </button>
          <div className="w-full mt-5 pt-5">
            {users.map((usr, index) => (
              <p key={usr.userId} className="my-2 text-center w-full">
                {usr.name} {user && user.userId === usr.userId && "(You)"}
              </p>
            ))}
          </div>
        </div>
      )}

      {openedChatTab && (
        <Chat setOpenedChatTab={setOpenedChatTab} socket={socket} />
      )}

      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold py-4 text-center">
          White Board Sharing App
          <span className="text-blue-600"> [Users Online: {users.length}]</span>
        </h1>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full px-4 md:px-8 lg:px-12 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center w-full md:w-auto">
            <div className="flex gap-2 items-center">
              <label htmlFor="pencil">Pencil</label>
              <input
                type="radio"
                name="tool"
                id="pencil"
                checked={tool === "pencil"}
                value="pencil"
                className="mt-1"
                onChange={(e) => setTool(e.target.value)}
              />
            </div>
            <div className="flex gap-2 items-center">
              <label htmlFor="line">Line</label>
              <input
                type="radio"
                id="line"
                name="tool"
                value="line"
                checked={tool === "line"}
                className="mt-1"
                onChange={(e) => setTool(e.target.value)}
              />
            </div>
            <div className="flex gap-2 items-center">
              <label htmlFor="rect">Rectangle</label>
              <input
                type="radio"
                name="tool"
                id="rect"
                checked={tool === "rect"}
                value="rect"
                className="mt-1"
                onChange={(e) => setTool(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center">
              <label htmlFor="color">Select Color: </label>
              <input
                type="color"
                id="color"
                className="mt-1 ml-3"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="bg-blue-500 text-white py-1 px-4 rounded-md mt-1 hover:bg-blue-600 transition-colors duration-200"
              disabled={elements.length === 0}
              onClick={undo}
            >
              Undo
            </button>
            <button
              className="border border-blue-500 text-blue-500 py-1 px-4 rounded-md mt-1 hover:bg-blue-500 hover:text-white transition-colors duration-200"
              disabled={history.length === 0}
              onClick={redo}
            >
              Redo
            </button>
          </div>
          <div>
            <button
              className="bg-red-500 text-white py-1 px-4 rounded-md hover:bg-red-600 transition-colors duration-200"
              onClick={handleClearCanvas}
            >
              Clear Canvas
            </button>
          </div>
        </div>
        <div className="w-full md:w-10/12 mx-auto mt-4 canvas-box">
          <WhiteBoard
            canvasRef={canvasRef}
            ctxRef={ctxRef}
            elements={elements}
            setElements={setElements}
            color={color}
            tool={tool}
            user={user}
            socket={socket}
          />
        </div>
      </div>
    </div>
  );
};

RoomPage.propTypes = {
  addVideoStream: PropTypes.func.isRequired,
  videoGrid: PropTypes.object,
  user: PropTypes.object.isRequired,
  myPeer: PropTypes.object.isRequired,
  setPeers: PropTypes.func.isRequired,
  socket: PropTypes.object.isRequired,
  users: PropTypes.array.isRequired,
  setUsers: PropTypes.func.isRequired,
  connectToNewUser: PropTypes.func.isRequired,
};

export default RoomPage;
