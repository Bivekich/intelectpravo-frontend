import { useEffect, useState } from "react";
import axios from "axios"; // Import axios
import Input from "../components/Input";
import Cookies from "universal-cookie";
import { Link, useNavigate, useParams } from "react-router-dom"; // Import useNavigate
import md5 from "md5";
import Timer from "../components/Timer";

const ConfirmAction = () => {
  const { action } = useParams();
  const cookies = new Cookies();
  const [code, setCode] = useState(""); // Initialize state with an empty string
  const [message, setMessage] = useState(""); // Initialize state with an empty string
  const [encodedCode, setEncodedCode] = useState(""); // Initialize state with an empty string
  const [cycle, setCycle] = useState(0); // Initialize state with an empty string
  const phone = cookies.get("phone");
  const email = cookies.get("email");
  const token = cookies.get("token");
  const lastpage = localStorage.getItem("lastpage");
  const navigate = useNavigate(); // Initialize navigate

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

  const base64ToBlob = (base64, contentType = "") => {
    const byteCharacters = atob(base64.split(",")[1]); // Decode Base64
    const byteNumbers = new Uint8Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    return new Blob([byteNumbers], { type: contentType });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    try {
      const response = await axios.post(
        "http://localhost:3030/profile/check-verify",
        {
          phoneNumber: phone,
          code: code,
          encodedCode: encodedCode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Successful response, status will be 2xx
      console.log(response);
      if (response.status === 200) {
        // Proceed to update profile if action matches
        if (action === "submitProfile") {
          axios({
            method: "post",
            url: "http://localhost:3030/profile/submit",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then((response) => {
              console.log(response);
            })
            .catch((error) => {
              console.log(error);
            });

          navigate(`/profile`);
        } else if (action == "buyproduct") {
          const producttobuy = localStorage.getItem("producttobuy");
          localStorage.setItem("product", producttobuy);
          navigate(`/buy/product/${producttobuy}`);
        } else if (action == "restorepass") {
          try {
            const newpass = localStorage.getItem("newpass");

            const response1 = await axios.post(
              `http://localhost:3030/profile/restore-password`,
              {
                newPassword: md5(newpass),
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (response1.status === 200) {
              setMessage("");
              cookies.remove("token");
              cookies.remove("phone");
              cookies.remove("page");
              navigate("/auth");
            }
          } catch (error) {
            console.error("An error occurred:", error);
            setMessage(error.response?.data?.message || "Произошла ошибка.");
          }
        } else if (action == "") {
          const currentPassword = localStorage.getItem("currentPassword");
          const newPassword = localStorage.getItem("newPassword");

          const response = await axios.post(
            "http://localhost:3030/profile/change-password", // Измените URL на свой
            {
              currentPassword: md5(currentPassword),
              newPassword: md5(newPassword),
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.status === 200) {
            navigate("/profile/?info=3");
          }
        }
      }
    } catch (error) {
      // Handle other errors or network issues
      console.error("An error occurred:", error);
      setMessage(error.response?.data?.message || "Произошла ошибка."); // Display error message
    }
  };

  const resendCode = async () => {
    if (localStorage.getItem("timer")) {
      alert("Нельзя отправить повторный код, до истечения таймера");
      return;
    } else {
      const response = await axios.post(
        "http://localhost:3030/auth/resendCode",
        {
          phoneNumber: phone,
        }
      );
      console.log(response);
      localStorage.removeItem("timer");
      setCycle(cycle + 1);
    }
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
      {message && <span>{message}</span>} {/* Only show message if not empty */}
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
      <Link
        to={lastpage}
        className="bg-transparent transition hover:scale-105 text-blue-400 hover:text-blue-400"
      >
        Вернуться
      </Link>
      <button
        type="submit"
        className="bg-blue-600 rounded-xl text-white transition hover:scale-105"
      >
        Подтвердить
      </button>
    </form>
  );
};

export default ConfirmAction;
