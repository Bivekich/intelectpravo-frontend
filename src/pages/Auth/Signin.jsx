import Input from "../../components/Input";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import axios from "axios";
import AcceptAll from "../../components/AcceptAll";
import md5 from "md5";

const SignIn = () => {
  const navigate = useNavigate();
  const cookies = new Cookies();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [profile, setProfile] = useState({
    name: "",
    surname: "",
    patronymic: "",
    email:
      cookies.get("email") ||
      (emailRegex.test(cookies.get("login")) ? cookies.get("login") : ""),
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(""); // For error messages

  const HandleInput = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    // Validate that passwords match
    if (profile.password !== profile.confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setError(""); // Clear any previous error messages

    axios({
      method: "post",
      url: "https://api.intelectpravo.ru/auth/register",
      data: {
        email: profile.email,
        name: profile.name,
        surname: profile.surname,
        patronymic: profile.patronymic,
        password: md5(profile.password), // Send only the password
      },
    })
      .then(function (response) {
        // Successful response, status will be 2xx
        console.log(response);
        if (response.status === 200) {
          navigate("/auth");
        }
      })
      .catch(function (error) {
        if (
          error.response &&
          error.response.data.message ===
            "Пользователь уже существует. Авторизуйтесь."
        ) {
          navigate("/auth");
        } else {
          // Handle other errors or network issues
          console.error("An error occurred:", error);
        }
      });
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 px-10 py-5 border-2 rounded-2xl max-w-[400px] w-full"
      >
        <h3 className="font-semibold text-xl">Регистрация</h3>
        <Input
          label="Email"
          type="email"
          name="email"
          value={profile.email}
          onChange={HandleInput}
          readOnly={profile.email}
          required
        />
        <Input
          label="Фамилия"
          type="text"
          name="surname"
          value={profile.surname}
          onChange={HandleInput}
          required
        />
        <Input
          label="Имя"
          type="text"
          name="name"
          value={profile.name}
          onChange={HandleInput}
          required
        />
        <Input
          label="Отчество"
          type="text"
          name="patronymic"
          value={profile.patronymic}
          onChange={HandleInput}
          required
        />
        <Input
          label="Придумайте пароль"
          type="password"
          name="password"
          value={profile.password}
          onChange={HandleInput}
          required
        />
        <Input
          label="Подтвердите пароль"
          type="password"
          name="confirmPassword"
          value={profile.confirmPassword}
          onChange={HandleInput}
          required
        />
        {error && <span className="text-red-600">{error}</span>}{" "}
        {/* Error message */}
        <AcceptAll name="accept" />
        <button
          type="submit"
          className="bg-blue-600 rounded-xl text-white transition hover:scale-105"
        >
          Зарегистрироватся
        </button>
      </form>
    </>
  );
};

export default SignIn;
