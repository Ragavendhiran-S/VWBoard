import { useState, useRef, useEffect } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import io from "socket.io-client";

import RoomPage from './pages/RoomPage';
import Forms from './components/Forms';

import './App.css';
import 'react-toastify/dist/ReactToastify.css';

const server = "http://localhost:5000";
const connectionOptions = {
  "force new connection": true,
  reconnectionAttempts: "Infinity",
  timeout: 10000,
  transports: ["websocket"],
};

const socket = io(server, connectionOptions);

const App = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [peers, setPeers] = useState({});
  const [myPeer, setMyPeer] = useState(null);
  const [openVideo, setOpenVideo] = useState(true);
  const videoGrid = useRef(null);
  const [stream, setStream] = useState(null);

  const addVideoStream = (div, video, stream) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });

    const existingDiv = document.getElementById(div.id);
    if (!existingDiv) {
      div.append(video);
      videoGrid.current.append(div);
    }
  };

  const connectToNewUser = (userId, name, stream) => {
    const call = myPeer.call(userId, stream);
    const div = document.createElement("div");
    div.id = userId;

    const video = document.createElement("video");
    const p = document.createElement("p");
    p.style.color = "white";
    p.innerText = name;

    div.append(p);

    call.on("stream", (userVideoStream) => {
      addVideoStream(div, video, userVideoStream);
    });

    call.on("close", () => {
      const existingDiv = document.getElementById(userId);
      if (existingDiv) {
        existingDiv.remove();
      }
    });

    setPeers((prevPeers) => ({
      ...prevPeers,
      [userId]: call,
    }));
  };

  // Cleanup function to stop video stream and notify the server when the tab/window is closed
  const stopStreamAndDisconnect = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (user && user.userId) {
      socket.emit("userDisconnected", user.userId);
    }
  };

  useEffect(() => {
    socket.on("userJoinedMessageBroadcasted", (data) => {
      setUsers(data.users);
      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: true,
        })
        .then((stream) => {
          setStream(stream);
          connectToNewUser(data.userId, data.name, stream);
        });
    });

    // Add event listener for tab/window close
    const handleBeforeUnload = (event) => {
      stopStreamAndDisconnect();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [socket, setUsers, myPeer, stream, user]);

  useEffect(() => {
    socket.on("userIsJoined", (data) => {
      if (data.success) {
        setUsers(data.users);
      }
    });

    socket.on("allUsers", (data) => {
      setUsers(data);
    });

    socket.on("userLeftMessageBroadcasted", (data) => {
      toast.info(`${data.name} left the room`);
      if (peers[data.userId]) peers[data.userId].close();
    });
  }, [peers]);

  const uuid = () => {
    let S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
  };

  return (
    <div className="container mx-auto">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        draggablePercent={60}
        progressStyle={{ backgroundColor: '#3B82F6' }}
        className="z-50"
        toastClassName="bg-blue-500 text-white font-bold rounded-lg py-2 px-4 shadow-lg"
      />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Forms
                uuid={uuid}
                setMyPeer={setMyPeer}
                socket={socket}
                setUser={setUser}
              />
            }
          />
          <Route
            path='/:roomId'
            element={
              <>
                <button
                  onClick={() => setOpenVideo(!openVideo)}
                  className="absolute top-2.5 right-2.5 z-10 bg-white border-none p-2.5 rounded-md cursor-pointer"
                >
                  Open Video
                </button>

                <div
                  className={`video-grid h-full fixed top-0 transition-all duration-300 ${openVideo ? "right-0" : "-right-full"} z-[1000]`}
                  ref={videoGrid}
                >
                  <button
                    className="btn btn-light"
                    onClick={() => setOpenVideo(false)}
                  >
                    Close
                  </button>
                </div>

                <RoomPage
                  connectToNewUser={connectToNewUser}
                  addVideoStream={addVideoStream}
                  videoGrid={videoGrid}
                  user={user}
                  myPeer={myPeer}
                  setPeers={setPeers}
                  socket={socket}
                  users={users}
                  setUsers={setUsers}
                />
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
