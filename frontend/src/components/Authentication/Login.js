import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { ChatState } from "../../Context/ChatProvider";

const Login = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = ChatState();

  const submitHandler = async () => {
    setLoading(true);

    if (!email || !password) {
      alert("Please fill all the fields.");
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        config
      );

      alert("Login Successful!");
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
    } catch (error) {
      alert(error?.response?.data?.message || "Login failed.");
      setLoading(false);
    }
  };

  return (
    <form className="login-form" onSubmit={(e) => e.preventDefault()}>
      <div className="form-group">
        <label>Email Address</label>
        <input
          type="email"
          value={email}
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Password</label>
        <div className="password-group">
          <input
            type={show ? "text" : "password"}
            value={password}
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="button" className="toggle" onClick={handleClick}>
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <button
        className="submit-button"
        onClick={submitHandler}
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <button
        type="button"
        className="guest-button"
        onClick={() => {
          setEmail("guest@example.com");
          setPassword("123456");
        }}
      >
        Get Guest User Credentials
      </button>
    </form>
  );
};

export default Login;
