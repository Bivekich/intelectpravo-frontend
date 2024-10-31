import { useEffect, useState } from "react";
import axios from "axios";
import Input from "../../components/Input";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";
import md5 from "md5";

const RestorePass = () => {
  const cookies = new Cookies();
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const phone = cookies.get("phone");
  const token = cookies.get("token");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!cookies.get("page")) {
      cookies.set("page", "/loginbypass", { path: "/" });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate if passwords match
    if (password !== passwordConfirmation) {
      setMessage("Пароли не совпадают");
      return;
    }

    try {
      // Verify action using the phone number from cookies
      const response = await axios.post(
        "https://api.intelectpravo.ru/profile/verify-action",
        { phoneNumber: phone }, // Send phone number
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (response.status === 200) {
        localStorage.setItem("newpass", password);
        navigate("/profile/confirmaction/restorepass"); // Change this to your desired route
      }
      return;
    } catch (error) {
      console.error("Verification failed:", error);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowPasswordConfirmation = () => {
    setShowPasswordConfirmation(!showPasswordConfirmation);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 px-10 py-5 border-2 rounded-2xl max-w-[400px] w-full"
    >
      <h3 className="font-semibold text-xl">
        Введите новый пароль учётной записи, зарегистрированной по номеру
        телефона: {phone}
      </h3>
      {message && <span className="text-red-500">{message}</span>}

      <div className="relative">
        <Input
          label="Новый пароль учётной записи"
          type={showPassword ? "text" : "password"}
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="button"
          onClick={toggleShowPassword}
          className="absolute right-0 top-1/2 transform bg-transparent -translate-y-1/2 text-blue-500 border-0"
          aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
        >
          {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
        </button>
      </div>

      <div className="relative">
        <Input
          label="Подтвердите новый пароль"
          type={showPasswordConfirmation ? "text" : "password"}
          name="passwordConfirmation"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          required
        />
        <button
          type="button"
          onClick={toggleShowPasswordConfirmation}
          className="absolute right-0 top-1/2 transform bg-transparent -translate-y-1/2 text-blue-500 border-0"
          aria-label={
            showPasswordConfirmation ? "Скрыть пароль" : "Показать пароль"
          }
        >
          {showPasswordConfirmation ? <EyeSlashIcon /> : <EyeIcon />}
        </button>
      </div>

      <button
        type="submit"
        className="bg-blue-600 rounded-xl text-white transition hover:scale-105"
      >
        Вход
      </button>
    </form>
  );
};

// SVG Components for the eye and eye-slash icons
const EyeIcon = () => (
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
);

const EyeSlashIcon = () => (
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
);

export default RestorePass;
