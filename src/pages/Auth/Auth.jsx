import React, { useState } from "react";
import axios from "axios";
import Input from "../../components/Input";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";

const Auth = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    login: "",
  });
  const [errorMessage, setErrorMessage] = useState(""); // Для отображения ошибок валидации
  const cookies = new Cookies();

  const HandleInput = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const validateLogin = (login) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9\s-()]{10,15}$/;
    return emailRegex.test(login) || phoneRegex.test(login);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Отключаем перезагрузку страницы

    // Валидация поля login
    if (!validateLogin(profile.login)) {
      setErrorMessage("Введите корректный email или номер телефона.");
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
        // Успешный ответ
        console.log(response);
        if (response.status === 200) {
          cookies.set("email", response.data.email, { path: "/" });
          navigate("/loginbypass");
        }
      })
      .catch(function (error) {
        if (error.response && error.response.status === 404) {
          // Обработка ошибки 404
          cookies.set("login", profile.login, { path: "/" });
          navigate("/signin");
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
          label="Введите логин"
          type="text"
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
