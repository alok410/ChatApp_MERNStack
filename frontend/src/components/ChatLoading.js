import "./ChatLoading.css"; // Make sure to create this CSS file

const ChatLoading = () => {
  return (
    <div className="loading-stack">
      {Array.from({ length: 12 }).map((_, index) => (
        <div className="skeleton" key={index}></div>
      ))}
    </div>
  );
};

export default ChatLoading;
