import { useEffect, useState } from "react";

const Chat = ({ setOpenedChatTab, socket, roomId }) => { // Accept roomId as a prop
  const [chat, setChat] = useState(() => {
    // Retrieve chat messages from localStorage based on roomId
    const savedChat = localStorage.getItem(`chatMessages_${roomId}`);
    return savedChat ? JSON.parse(savedChat) : [];
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Listen for incoming messages
    socket.on("messageResponse", (data) => {
      setChat((prevChats) => {
        const updatedChats = [...prevChats, data];
        // Save the updated chat messages to localStorage with roomId
        localStorage.setItem(`chatMessages_${roomId}`, JSON.stringify(updatedChats));
        return updatedChats;
      });
    });

    // Clean up the socket listener when the component unmounts
    return () => {
      socket.off("messageResponse");
    };
  }, [socket, roomId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() !== "") {
      const newMessage = { message, name: "You" };
      setChat((prevChats) => {
        const updatedChats = [...prevChats, newMessage];
        // Save the updated chat messages to localStorage with roomId
        localStorage.setItem(`chatMessages_${roomId}`, JSON.stringify(updatedChats));
        return updatedChats;
      });
      socket.emit("message", { message, roomId }); // Include roomId when sending message
      setMessage("");
    }
  };

  return (
    <div className="fixed top-0 h-full text-white bg-gray-800" style={{ width: "400px", left: "0%" }}>
      <button
        type="button"
        onClick={() => setOpenedChatTab(false)}
        className="bg-gray-300 text-gray-800 w-full mt-5 rounded py-2 hover:bg-gray-400 transition duration-200"
      >
        Close
      </button>
      <div
        className="w-full mt-5 p-2 border border-white rounded-lg"
        style={{ height: "70%", overflowY: "auto" }}
      >
        {chat.map((msg, index) => (
          <p
            key={index}
            className="my-2 text-center w-full py-2 border-b border-gray-600"
          >
            {msg.name}: {msg.message}
          </p>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="w-full mt-4 flex rounded-lg">
        <input
          type="text"
          placeholder="Enter message"
          className="h-full border-0 rounded-l-lg py-2 px-4 flex-grow"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 text-white rounded-r-lg py-2 px-4 hover:bg-blue-400 transition duration-200">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
