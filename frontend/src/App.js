import "./App.css";
import Homepage from "./Pages/Homepage";
import Chatpage from "./Pages/Chatpage";
import { Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";

function App() {
  return (
      <div>
    <div className="App">

      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/chats" element={<Chatpage />} />
      </Routes>
      </div>
      <Footer/>
    </div>
  );
}

export default App; 
