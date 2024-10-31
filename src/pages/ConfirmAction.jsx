import { useEffect, useState } from "react";
import axios from "axios"; // Import axios
import Input from "../components/Input";
import Cookies from "universal-cookie";
import { useNavigate, useParams } from "react-router-dom"; // Import useNavigate
import md5 from "md5";

const ConfirmAction = () => {
  const { action } = useParams();
  const cookies = new Cookies();
  const [code, setCode] = useState(""); // Initialize state with an empty string
  const [message, setMessage] = useState(""); // Initialize state with an empty string
  const phone = cookies.get("phone");
  const token = cookies.get("token");
  const navigate = useNavigate(); // Initialize navigate

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
        "https://api.intelectpravo.ru/profile/check-verify",
        {
          phoneNumber: phone,
          code: code,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      // Successful response, status will be 2xx
      console.log(response);
      if (response.status === 200) {
        // Proceed to update profile if action matches
        if (action === "submitProfile") {
          axios({
            method: "post",
            url: "https://api.intelectpravo.ru/profile/submit",
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
              `https://api.intelectpravo.ru/profile/restore-password`,
              {
                newPassword: md5(newpass),
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
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
            "https://api.intelectpravo.ru/profile/change-password", // Измените URL на свой
            {
              currentPassword: md5(currentPassword),
              newPassword: md5(newPassword),
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
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

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 px-10 py-5 border-2 rounded-2xl max-w-[400px] w-full"
    >
      <h3 className="font-semibold text-xl">
        Введите код подтверждения, который был отправлен Вам на телефон: {phone}
      </h3>
      {message && <span>{message}</span>} {/* Only show message if not empty */}
      <Input
        label="Код"
        type="text"
        name="code"
        value={code}
        onChange={(e) => setCode(e.target.value)} // Proper onChange handler
        required
      />
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
