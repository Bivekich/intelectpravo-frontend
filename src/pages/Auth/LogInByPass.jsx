import { useEffect, useState } from "react";
import axios from "axios"; // Import axios
import Input from "../../components/Input";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import md5 from "md5";

const LogInByPass = () => {
  const cookies = new Cookies();
  const [password, setPassword] = useState(""); // Initialize state with an empty string for password
  const [message, setMessage] = useState(""); // Initialize state with an empty string for message
  const phone = cookies.get("phone");
  const navigate = useNavigate(); // Initialize navigate
  useEffect(() => {
    if (!cookies.get("page")) {
      cookies.set("page", "/loginbypass", { path: "/" });
    }
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    try {
      const response = await axios.post(
        "https://api.intelectpravo.ru/auth/loginByPass",
        {
          phoneNumber: phone,
          password: md5(password),
        }
      );

      // Successful response, status will be 2xx
      console.log(response);
      if (response.status === 200) {
        setMessage("");
        cookies.remove("page");
        navigate("/signup");
        // Redirect to home after successful login
      }
    } catch (error) {
      // Handle other errors or network issues
      console.error("An error occurred:", error);
      setMessage(error.response.data.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 px-10 py-5 border-2 rounded-2xl max-w-[400px] w-full"
    >
      <h3 className="font-semibold text-xl">
        Вход с использованием телефона: {phone}
      </h3>
      {message && <span>{message}</span>}
      <Input
        label="Пароль"
        type="password" // Change to password type
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)} // Proper onChange handler
        required
      />
      <button
        type="submit"
        className="bg-blue-600 rounded-xl text-white transition hover:scale-105"
      >
        Войти
      </button>
    </form>
  );
};

export default LogInByPass;
