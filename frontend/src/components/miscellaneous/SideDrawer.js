// SideDrawer.jsx (Manual CSS Version)
import  { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";
import UserListItem from "../userAvatar/UserListItem";
import ProfileModal from "./ProfileModal";
import "./SideDrawer.css";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const {
    setSelectedChat,
    user,
    notification,
    chats,
    setChats,
  } = ChatState();

  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleSearch = async () => {
    if (!search) {
      alert("Please enter something to search");
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setSearchResult(data);
      setLoading(false);
    } catch (error) {
      alert("Error loading search results");
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setDrawerOpen(false);
      setLoadingChat(false);
    } catch (error) {
      alert("Error accessing the chat");
    }
  };

  return (
    <>
      <div className="sidedrawer-header">
        <button className="search-btn" onClick={() => setDrawerOpen(true)}>
          🔍 Search User
        </button>
        <h1 className="brand">Talk-App By Aalok</h1>
        <div className="menu-section">
          <div className="notification-icon">
            🔔
            {notification.length > 0 && (
              <span className="notification-badge">{notification.length}</span>
            )}
          </div>
          <div className="dropdown">
            <img
              src={user.pic}
              alt="avatar"
              className="avatar"
            />
            <div className="dropdown-content">
              <ProfileModal user={user}>
                <span>My Profile</span>
              </ProfileModal>
              <hr />
              <span onClick={logoutHandler}>Logout</span>
            </div>
          </div>
        </div>
      </div>

      {isDrawerOpen && (
        <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />
      )}
      <div className={`drawer ${isDrawerOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <h2>Search Users</h2>
        </div>
        <div className="drawer-body">
          <div className="search-input">
            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button onClick={handleSearch}>Go</button>
          </div>
          <div className="search-results">
            {loading ? (
              <p>Loading...</p>
            ) : (
              searchResult.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <p>Opening Chat...</p>}
          </div>
        </div>
      </div>
    </>
  );
}

export default SideDrawer;