import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import PropTypes from 'prop-types';
import 'react-toastify/dist/ReactToastify.css';
import Peer from "peerjs";

const CreateRoomForm = ({ uuid, socket, setUser, setMyPeer }) => {
    const [roomId, setRoomId] = useState('');
    const [userName, setUserName] = useState('');
    const navigate = useNavigate(); // Initialize navigate

    const handleGenerateRoomId = () => {
        const newRoomId = uuid();
        setRoomId(newRoomId);
        toast.success(`Room ID ${newRoomId} generated!`);
    };

    const handleCreateRoom = (e) => {
        e.preventDefault();

        // {name,roomId, userId, host, presenter}

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
                host: true,
                presenter: true,
            };
            setUser(roomData);
            navigate(`/${roomId}`);
            console.log(roomData);
            socket.emit("userJoined", roomData);
        });
        myPeer.on("error", (err) => {
            console.log("peer connection error", err);
            this.myPeer.reconnect();
        });
    };


    return (
        <>
            <form className="w-full max-w-md mx-auto p-6 bg-white shadow-md rounded-lg space-y-4 min-w-96" onSubmit={handleCreateRoom}>
                <div className="flex flex-col">
                    <label htmlFor="user-name" className="text-gray-700 font-semibold mb-1">User Name</label>
                    <input
                        type="text"
                        id="user-name"
                        placeholder="Enter your name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            id="room-code"
                            disabled
                            placeholder="Generate Room ID"
                            className="flex-1 p-2 border border-gray-300 rounded bg-gray-100 text-gray-500 focus:outline-none"
                            value={roomId}
                        />
                        <button
                            type="button"
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200 h-10"
                            onClick={handleGenerateRoomId}
                        >
                            Generate
                        </button>
                        <CopyToClipboard
                            text={roomId}
                            onCopy={() => toast.success("Room ID copied to clipboard")}
                        >
                            <button
                                type="button"
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200 h-10"
                                disabled={!roomId}
                            >
                                Copy
                            </button>
                        </CopyToClipboard>
                    </div>
                </div>
                <div className="flex justify-center">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-green-500 text-white font-semibold rounded hover:bg-green-600 transition duration-200 min-w-40 max-w-45"
                    >
                        Generate Room
                    </button>
                </div>
            </form>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                limit={3}
            />
        </>
    );
};

CreateRoomForm.propTypes = {
    uuid: PropTypes.func.isRequired,
    socket: PropTypes.object.isRequired,
    setUser: PropTypes.func.isRequired,
    setMyPeer: PropTypes.func.isRequired,
};

export default CreateRoomForm;
