import "./SingleChat.css";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import { io } from "socket.io-client";
import { ChatState } from "../Context/ChatProvider";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";

const ENDPOINT = "http://localhost:5000"; // Use your deployed URL if hosted
let socket;
let selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);

  const { selectedChat, setSelectedChat, user, notification, setNotification } = ChatState();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const fetchMessages = useCallback(async () => {
    if (!selectedChat) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      setLoading(true);
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      alert("Failed to load the messages");
    }
  }, [selectedChat, user.token]);

  const pollMessages = useCallback(() => {
    if (!selectedChat) return;
    const config = {
      headers: { Authorization: `Bearer ${user.token}` },
    };
    axios
      .get(`/api/message/${selectedChat._id}`, config)
      .then((res) => {
        setMessages(res.data);
      })
      .catch((err) => {
        console.error("Polling failed", err);
      });
  }, [selectedChat, user.token]);

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );
        setNewMessage("");
        setMessages((prev) => [...prev, data]);
        socket.emit("new message", data);
      } catch (error) {
        console.error("Failed to send the message", error);
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;

    // Clear previous polling interval
    if (pollingInterval) clearInterval(pollingInterval);

    // Set new polling interval
    const interval = setInterval(() => {
      pollMessages();
    }, 5000);
    setPollingInterval(interval);

    return () => {
      clearInterval(interval); // clear on chat switch or unmount
    };
  }, [selectedChat, fetchMessages, pollMessages]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id) {
        if (!notification.some((msg) => msg._id === newMessageRecieved._id)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages((prev) => [...prev, newMessageRecieved]);
      }
    });

    return () => {
      socket.off("message recieved");
    };
  }, [notification, fetchAgain]);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    const timerLength = 3000;

    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <div className="chat-header">
            <button className="back-button" onClick={() => setSelectedChat("")}>
              ⟵
            </button>
            <span className="chat-title">
              {!selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}
                  <ProfileModal user={getSenderFull(user, selectedChat.users)} />
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              )}
            </span>
          </div>

          <div className="chat-box">
            {loading ? (
              <div className="spinner">Loading...</div>
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            {istyping && (
              <div className="typing-animation">
                <Lottie options={defaultOptions} width={70} style={{ marginBottom: 15 }} />
              </div>
            )}

            <input
              type="text"
              placeholder="Enter a message..."
              value={newMessage}
              onChange={typingHandler}
              onKeyDown={sendMessage}
              className="chat-input"
            />
          </div>
        </>
      ) : (
        <div className="no-chat-selected">
          <h2>Click on a user to start chatting</h2>
        </div>
      )}
    </>
  );
};

export default SingleChat;
