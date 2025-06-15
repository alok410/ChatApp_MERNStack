import { ChatState } from "../../Context/ChatProvider";
import "./UserListItem.css";

const UserListItem = ({ handleFunction }) => {
  const { user } = ChatState();

  return (
    <div className="user-list-item" onClick={handleFunction}>
      {user.pic ? (
        <img src={user.pic} alt={user.name} className="user-avatar" />
      ) : (
        <div className="user-avatar fallback">
          {user.name?.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="user-info">
        <div className="user-name">{user.name}</div>
        <div className="user-email">
          <strong>Email:</strong> {user.email}
        </div>
      </div>
    </div>
  );
};

export default UserListItem;
