import { useEffect, useState } from "react";
import axios from "axios"; // Import axios
import Input from "../../components/Input";
import Cookies from "universal-cookie";
import { useNavigate, Link } from "react-router-dom"; // Import useNavigate
import Timer from "../../components/Timer";

const SignUp = () => {
  const cookies = new Cookies();
  const [code, setCode] = useState(""); // Initialize state with an empty string
  const [encodedCode, setEncodedCode] = useState(""); // Initialize state with an empty string
  const [message, setMessage] = useState(""); // Initialize state with an empty string
  const [cycle, setCycle] = useState(0); // Initialize state with an empty string
  const [changeProfile, setChangeProfile] = useState(false);
  const phone = cookies.get("phone");
  const email = cookies.get("email");
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    if (!cookies.get("page")) {
      cookies.set("page", "/signin", { path: "/" });
    }

    const savedProfile = localStorage.getItem("draftProfile");
    const savedTime = localStorage.getItem("draftProfileTime");

    if (savedProfile && savedTime) {
      const timeElapsed = Date.now() - Number(savedTime);
      if (timeElapsed < 5 * 60 * 1000) {
        // 5 minutes
        setChangeProfile(true);
      } else {
        setChangeProfile(false);
        localStorage.removeItem("draftProfile");
        localStorage.removeItem("draftProfileTime");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("draftProfileTime", Date.now());
    cookies.set("draftProfileTime", Date.now(), { path: "/", maxAge: 10 * 60 }); // 10 минут
    // Установка таймера на 10 минут для удаления куков
    const timer = setTimeout(() => {
      cookies.remove("draftProfileTime", { path: "/" });
    }, 10 * 60 * 1000); // 10 минут в миллисекундах

    // Очистка таймера при размонтировании компонента
    return () => clearTimeout(timer);
  }, []);

  // Prevent navigation away from this page
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = ""; // Show confirmation dialog
    };

    // Prevent back/forward navigation
    const handlePopState = (event) => {
      event.preventDefault();
      window.history.pushState(null, null, window.location.href); // Push the current state back to the history
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    // Push the current state to the history to prevent going back
    window.history.pushState(null, null, window.location.href);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    try {
      const response1 = await axios.get("https://api.ipify.org?format=json");
      const response = await axios.post(
        "https://api.intelectpravo.ru/auth/verify",
        {
          phoneNumber: phone,
          code: code,
          encodedCode: encodedCode,
          ipAddress: response1.data.ip,
        }
      );

      // Successful response, status will be 2xx
      console.log(response);
      if (response.status === 200) {
        var now = new Date();
        var time = now.getTime();
        var expireTime = time + 1000 * 3600 * 24; // 24 hours
        now.setTime(expireTime);
        cookies.remove("page");

        // Set token cookie
        cookies.set("token", response.data.token, {
          path: "/",
          expires: now, // Pass Date object
        });

        localStorage.removeItem("timer");

        navigate("/");
      }
    } catch (error) {
      // Handle other errors or network issues
      console.error("An error occurred:", error);
      setMessage(error.response?.data?.message || "An error occurred");
    }
  };

  const resendCode = async () => {
    if (localStorage.getItem("timer")) {
      alert("Нельзя отправить повторный код, до истечения таймера");
      return;
    }
    const response = await axios.post(
      "https://api.intelectpravo.ru/auth/resendCode",
      {
        phoneNumber: phone,
      }
    );
    console.log(response);
    localStorage.removeItem("timer");
    setCycle(cycle + 1);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 px-10 py-5 border-2 rounded-2xl max-w-[400px] w-full"
    >
      <h3 className="font-semibold text-xl">
        Введите код подтверждения, который был отправлен Вам на <br />
        <br />
        Почту: {email} <br />
        <br />
        Телефон: {phone}
      </h3>
      <Timer cycle={cycle} />
      {message && <span>{message}</span>}
      <Input
        label="Код с телефона"
        type="text"
        name="code"
        value={code}
        onChange={(e) => setCode(e.target.value)} // Proper onChange handler
        required
      />
      <Input
        label="Код с почты"
        type="text"
        name="code"
        value={encodedCode}
        onChange={(e) => setEncodedCode(e.target.value)} // Proper onChange handler
        required
      />
      <button
        type="button"
        onClick={resendCode}
        className="bg-transparent transition hover:scale-105 p-0 border-0 text-blue-400"
      >
        Выслать код повторно
      </button>
      {changeProfile && (
        <Link
          to="/signin"
          className="bg-transparent transition hover:scale-105 text-blue-400 hover:text-blue-400"
        >
          Изменить данные УЗ
        </Link>
      )}
      <button
        type="submit"
        className="bg-blue-600 rounded-xl text-white transition hover:scale-105 h-[46px]"
      >
        Вход
      </button>
    </form>
  );
};

export default SignUp;
