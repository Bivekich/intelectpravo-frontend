import { useEffect, useState } from "react";
import axios from "axios"; // Import axios
import Input from "../../components/Input";
import Cookies from "universal-cookie";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import md5 from "md5";

const LogInByPass = () => {
  const cookies = new Cookies();
  const [password, setPassword] = useState(""); // Initialize state with an empty string for password
  const [message, setMessage] = useState(""); // Initialize state with an empty string for message
  const phone = cookies.get("phone");
  const [showPassword, setShowPassword] = useState(false);
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
        cookies.set("email", response.data.email);
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

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 px-10 py-5 border-2 rounded-2xl max-w-[400px] w-full"
    >
      <h3 className="font-semibold text-xl">
        Введите пароль учётной записи, зарегистрированной по номеру телефона:{" "}
        {phone}
      </h3>
      {message && <span>{message}</span>}
      <div className="relative">
        <Input
          label="Введите пароль учётной записи"
          type={showPassword ? "text" : "password"} // Change to password type
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Proper onChange handler
          required
        />
        <button
          type="button"
          onClick={toggleShowPassword}
          className="absolute right-0 top-1/2 transform bg-transparent -translate-y-1/2 text-blue-500 border-0"
          aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"} // Accessibility
        >
          {showPassword ? (
            // Eye Slash SVG
            <svg
              width="20px"
              height="20px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.99902 3L20.999 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 11.9992 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5"
                stroke="#535bf2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            // Eye SVG
            <svg
              width="20px"
              height="20px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.0007 12C15.0007 13.6569 13.6576 15 12.0007 15C10.3439 15 9.00073 13.6569 9.00073 12C9.00073 10.3431 10.3439 9 12.0007 9C13.6576 9 15.0007 10.3431 15.0007 12Z"
                stroke="#535bf2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.0012 5C7.52354 5 3.73326 7.94288 2.45898 12C3.73324 16.0571 7.52354 19 12.0012 19C16.4788 19 20.2691 16.0571 21.5434 12C20.2691 7.94291 16.4788 5 12.0012 5Z"
                stroke="#535bf2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
      {message && <Link to="/restorepass">Восстановить пароль</Link>}
      <button
        type="submit"
        className="bg-blue-600 rounded-xl text-white transition hover:scale-105"
      >
        Вход
      </button>
    </form>
  );
};

export default LogInByPass;
