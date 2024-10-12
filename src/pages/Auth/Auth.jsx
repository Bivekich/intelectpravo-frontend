import React, { useState } from "react";
import axios from "axios";
import Input from "../../components/Input";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";

const Auth = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    login: "+7", // Automatically set the default value to +7
  });
  const [errorMessage, setErrorMessage] = useState(""); // For validation errors
  const cookies = new Cookies();

  const HandleInput = (e) => {
    let { name, value } = e.target;

    // Automatically prepend +7 if not present
    if (!value.startsWith("+7")) {
      value = "+7" + value.replace(/\D/g, ""); // Remove non-numeric characters
    }

    // Limit the input to +7 followed by 10 digits
    if (value.length > 12) {
      value = value.slice(0, 12);
    }

    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const validatePhone = (login) => {
    const phoneRegex = /^\+7[0-9]{10}$/; // Validate the phone number format (10 digits after +7)
    return phoneRegex.test(login);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    // Validate phone number
    if (!validatePhone(profile.login)) {
      setErrorMessage(
        "Введите корректный номер телефона (должен начинаться с +7 и содержать 10 цифр)."
      );
      return;
    }

    axios({
      method: "post",
      url: "https://api.intelectpravo.ru/auth/login",
      data: {
        login: profile.login,
      },
    })
      .then(function (response) {
        // Successful response
        console.log(response);
        if (response.status === 200) {
          cookies.set("phone", response.data.phone, { path: "/" });
          navigate("/loginbypass");
        }
      })
      .catch(function (error) {
        if (error.response && error.response.status === 404) {
          // Handle 404 error
          if (confirm("Данного аккаунта не существует, зарегистрируйтесь")) {
            cookies.set("login", profile.login, { path: "/" });
            navigate("/signin");
          }
        } else {
          console.error("Произошла ошибка:", error);
        }
      });
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 px-10 py-5 border-2 rounded-2xl max-w-[400px] w-full"
      >
        <h3 className="font-semibold text-xl">Вход в систему</h3>
        <Input
          label="Введите номер телефона"
          type="tel"
          name="login"
          value={profile.login}
          onChange={HandleInput}
          required
        />

        {errorMessage && <div className="text-red-500">{errorMessage}</div>}

        <button
          type="submit"
          className="bg-blue-600 rounded-xl text-white transition hover:scale-105"
        >
          Дальше
        </button>
      </form>
    </>
  );
};

export default Auth;
