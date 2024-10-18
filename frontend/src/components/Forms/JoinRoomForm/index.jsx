const JoinRoomForm = () => {
  return (
    <form className="w-full max-w-md mx-auto p-6 bg-white shadow-md rounded-lg space-y-4">
      <div className="flex flex-col">
        <label htmlFor="name" className="text-gray-700 font-semibold mb-1">Your Name</label>
        <input
          type="text"
          id="name"
          placeholder="Enter your name"
          className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="room-code" className="text-gray-700 font-semibold mb-1">Room Code</label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            id="room-code"
            disabled
            placeholder="Generate room code"
            className="flex-1 p-2 border border-gray-300 rounded bg-gray-100 text-gray-500 focus:outline-none"
          />
          <button
            type="button"
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
          >
            Generate
          </button>
          <button
            type="button"
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition duration-200"
          >
            Copy
          </button>
        </div>
      </div>
      <div className="flex justify-center">
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white font-semibold rounded hover:bg-green-600 transition duration-200"
        >
          Join Room
        </button>
      </div>
    </form>
  );
};

export default JoinRoomForm;
