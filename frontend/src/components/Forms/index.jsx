import CreateRoomForm from "./CreateRoomForm";
import JoinRoomForm from "./JoinRoomForm";

const Forms = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="flex flex-wrap justify-center space-x-4">
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 m-2">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">Create Room</h1>
          <CreateRoomForm />
        </div>
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 m-2">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">Join Room</h1>
          <JoinRoomForm />
        </div>
      </div>
    </div>
  );
};

export default Forms;
