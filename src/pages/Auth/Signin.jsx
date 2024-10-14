import Input from "../../components/Input";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import axios from "axios";
import AcceptAll from "../../components/AcceptAll";
import md5 from "md5";

const SignIn = () => {
  const navigate = useNavigate();
  const cookies = new Cookies();
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  const cyrillicRegex = /^[А-ЯЁ][а-яё]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const [profile, setProfile] = useState({
    name: "",
    surname: "",
    patronymic: "",
    phone:
      cookies.get("phone") ||
      (phoneRegex.test(cookies.get("login")) ? cookies.get("login") : ""),
    password: "",
    confirmPassword: "",
    email: "", // Added email field
  });

  const [error, setError] = useState(""); // Error messages
  const [validationError, setValidationError] = useState({
    name: "",
    surname: "",
    patronymic: "",
  }); // Field validation errors

  const [passwordValidation, setPasswordValidation] = useState(""); // Password validation errors

  useEffect(() => {
    const savedProfile = localStorage.getItem("draftProfile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const saveDraftToLocalStorage = (data) => {
    localStorage.setItem("draftProfile", JSON.stringify(data));
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push("Пароль должен содержать не менее 8 символов.");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Пароль должен содержать хотя бы одну заглавную букву.");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Пароль должен содержать хотя бы одну строчную букву.");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Пароль должен содержать хотя бы одну цифру.");
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push(
        "Пароль должен содержать хотя бы один специальный символ (!@#$%^&*)."
      );
    }
    return errors;
  };

  const handleInput = (e) => {
    const { name, value } = e.target;

    const maxLength = {
      phone: 22,
      name: 22,
      surname: 22,
      patronymic: 22,
      password: 22,
      confirmPassword: 22,
      email: 100,
    };

    if (value.length > maxLength[name]) {
      return;
    }

    if (["name", "surname", "patronymic"].includes(name)) {
      if (!cyrillicRegex.test(value)) {
        setValidationError((prevErrors) => ({
          ...prevErrors,
          [name]:
            "Поле должно начинаться с заглавной буквы и содержать только кириллицу",
        }));
      } else {
        setValidationError((prevErrors) => ({
          ...prevErrors,
          [name]: "",
        }));
      }
    }

    if (name === "email" && !emailRegex.test(value)) {
      setError("Неверный формат email.");
    } else {
      setError("");
    }

    if (name === "password") {
      const passwordErrors = validatePassword(value);
      setPasswordValidation(passwordErrors.join(" "));
    }

    const updatedProfile = { ...profile, [name]: value };
    setProfile(updatedProfile);
    saveDraftToLocalStorage(updatedProfile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(validationError).some((msg) => msg !== "")) {
      setError("Пожалуйста, исправьте ошибки в форме.");
      return;
    }

    if (profile.password !== profile.confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    const passwordErrors = validatePassword(profile.password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join(" "));
      return;
    }

    setError("");

    axios({
      method: "post",
      url: "https://api.intelectpravo.ru/auth/register",
      data: {
        phone: profile.phone,
        name: profile.name,
        surname: profile.surname,
        patronymic: profile.patronymic,
        password: md5(profile.password),
        email: profile.email, // Added email field
      },
    })
      .then(function (response) {
        if (response.status === 200) {
          localStorage.removeItem("draftProfile");
          cookies.set("phone", profile.phone, { path: "/" });
          navigate("/signup");
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
        <h3 className="font-semibold text-xl">Регистрация</h3>
        <Input
          label="Телефон"
          type="tel"
          name="phone"
          value={profile.phone}
          onChange={handleInput}
          readOnly={
            cookies.get("phone") ||
            (phoneRegex.test(cookies.get("login")) ? cookies.get("login") : "")
          }
          required
          maxLength={22}
        />
        <Input
          label="Email"
          type="email"
          name="email"
          value={profile.email}
          onChange={handleInput}
          required
          maxLength={100}
        />
        <Input
          label="Фамилия"
          type="text"
          name="surname"
          value={profile.surname}
          onChange={handleInput}
          required
          maxLength={22}
        />
        {validationError.surname && (
          <span className="text-red-600">{validationError.surname}</span>
        )}
        <Input
          label="Имя"
          type="text"
          name="name"
          value={profile.name}
          onChange={handleInput}
          required
          maxLength={22}
        />
        {validationError.name && (
          <span className="text-red-600">{validationError.name}</span>
        )}
        <Input
          label="Отчество"
          type="text"
          name="patronymic"
          value={profile.patronymic}
          onChange={handleInput}
          required
          maxLength={22}
        />
        {validationError.patronymic && (
          <span className="text-red-600">{validationError.patronymic}</span>
        )}
        <Input
          label="Придумайте пароль"
          type="password"
          name="password"
          value={profile.password}
          onChange={handleInput}
          required
          maxLength={22}
        />
        {passwordValidation && (
          <span className="text-red-600">{passwordValidation}</span>
        )}
        <Input
          label="Подтвердите пароль"
          type="password"
          name="confirmPassword"
          value={profile.confirmPassword}
          onChange={handleInput}
          required
          maxLength={22}
        />
        {error && <span className="text-red-600">{error}</span>}
        <AcceptAll name="accept" />
        <button
          type="submit"
          className="bg-blue-600 rounded-xl text-white transition hover:scale-105"
        >
          Зарегистрироваться
        </button>
      </form>
    </>
  );
};

export default SignIn;
