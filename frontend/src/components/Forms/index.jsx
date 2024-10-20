import CreateRoomForm from "./CreateRoomForm";
import JoinRoomForm from "./JoinRoomForm";
import PropTypes from 'prop-types';

const Forms = ({ uuid, socket, setUser, setMyPeer }) => {



  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6 ">
      {/* flex flex-wrap  */}
      <div className="flex flex-row justify-center space-x-4">
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 m-2">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">Create Room</h1>
          <CreateRoomForm
            uuid={uuid}
            setMyPeer={setMyPeer}
            socket={socket}
            setUser={setUser} />
        </div>
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 m-2">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">Join Room</h1>
          <JoinRoomForm
            uuid={uuid}
            setMyPeer={setMyPeer}
            socket={socket}
            setUser={setUser} />
        </div>
      </div>
    </div>
  );
};



Forms.propTypes = {
  uuid: PropTypes.string.isRequired,
  socket: PropTypes.object.isRequired,
  setUser: PropTypes.func.isRequired,
  setMyPeer: PropTypes.func.isRequired,
};

export default Forms;
