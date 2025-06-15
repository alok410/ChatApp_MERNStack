import { useState } from "react";
import "./ProfileModal.css"; // CSS file you'll create below
import defaultIcon from "./image.png"; // Replace with actual icon or an SVG

const ProfileModal = ({ user, children }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {children ? (
        <span onClick={() => setShowModal(true)}>{children}</span>
      ) : (
        <button className="icon-button" onClick={() => setShowModal(true)}>
          <img src={defaultIcon} alt="View" className="icon-img" />
        </button>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal profile-modal">
            <div className="modal-header">
              <h2>{user.name}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              <img
                className="profile-image"
                src={user.pic}
                alt={user.name}
              />
              <p className="user-email">Email: {user.email}</p>
            </div>

            <div className="modal-footer">
              <button className="submit-btn" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileModal;
