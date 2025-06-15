import axios from "axios";
import { useEffect, useState } from "react";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import "./MyChats.css";
import { io } from "socket.io-client";

// Create only one socket connection
const ENDPOINT = "http://localhost:5000"; // ✅ Change this to your backend URL
const socket = io(ENDPOINT);

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      alert("Error: Failed to load the chats");
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userInfo"));
    setLoggedUser(storedUser);
    fetchChats();

    // Setup socket
    socket.emit("setup", storedUser);

    // Listen for new messages
    socket.on("message recieved", () => {
      fetchChats(); // only fetch chats when a message is received
    });

    // Cleanup
    return () => {
      socket.off("message recieved");
    };
  }, [fetchAgain]);

  return (
    <div className={`mychats-container ${selectedChat ? "hide-on-mobile" : ""}`}>
      <div className="mychats-header">
        <h2>My Chats</h2>
        <GroupChatModal>
          <button className="new-group-btn">+ New Group Chat</button>
        </GroupChatModal>
      </div>
      <div className="chat-list">
        {chats ? (
          <div className="chat-scroll">
            {chats.map((chat) => (
              <div
                key={chat._id}
                className={`chat-item ${selectedChat === chat ? "chat-selected" : ""}`}
                onClick={() => setSelectedChat(chat)}
              >
                <div className="chat-title">
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </div>
                {chat.latestMessage && (
                  <div className="chat-message">
                    <strong>{chat.latestMessage.sender.name}:</strong>{" "}
                    {chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 51) + "..."
                      : chat.latestMessage.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <ChatLoading />
        )}
      </div>
    </div>
  );
};

export default MyChats;
