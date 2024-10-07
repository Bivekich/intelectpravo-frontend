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
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const cyrillicRegex = /^[А-ЯЁ][а-яё]+$/; // Регулярное выражение для валидации кириллицы

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

  const [error, setError] = useState(""); // Для сообщений об ошибках
  const [validationError, setValidationError] = useState({
    name: "",
    surname: "",
    patronymic: "",
  }); // Ошибки валидации полей

  // Восстановление данных из localStorage при загрузке компонента
  useEffect(() => {
    const savedProfile = localStorage.getItem("draftProfile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  // Сохранение черновика в localStorage
  const saveDraftToLocalStorage = (data) => {
    localStorage.setItem("draftProfile", JSON.stringify(data));
  };

  // Функция для валидации пароля
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

  const HandleInput = (e) => {
    const { name, value } = e.target;

    // Проверка для имени, фамилии и отчества
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

    const updatedProfile = { ...profile, [name]: value };
    setProfile(updatedProfile);

    // Сохранение обновленного черновика
    saveDraftToLocalStorage(updatedProfile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Предотвращаем перезагрузку страницы

    // Проверка на ошибки валидации
    if (Object.values(validationError).some((msg) => msg !== "")) {
      setError("Пожалуйста, исправьте ошибки в форме.");
      return;
    }

    // Проверка на совпадение паролей
    if (profile.password !== profile.confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    // Валидация пароля
    const passwordErrors = validatePassword(profile.password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join(" "));
      return;
    }

    setError(""); // Очищаем предыдущие ошибки

    axios({
      method: "post",
      url: "https://api.intelectpravo.ru/auth/register",
      data: {
        email: profile.email,
        name: profile.name,
        surname: profile.surname,
        patronymic: profile.patronymic,
        password: md5(profile.password), // Отправляем только пароль
      },
    })
      .then(function (response) {
        console.log(response);
        if (response.status === 200) {
          // Очищаем черновик после успешной регистрации
          localStorage.removeItem("draftProfile");
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
          label="Email"
          type="email"
          name="email"
          value={profile.email}
          onChange={HandleInput}
          readOnly={
            cookies.get("email") ||
            (emailRegex.test(cookies.get("login")) ? cookies.get("login") : "")
          }
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
        {validationError.surname && (
          <span className="text-red-600">{validationError.surname}</span>
        )}
        <Input
          label="Имя"
          type="text"
          name="name"
          value={profile.name}
          onChange={HandleInput}
          required
        />
        {validationError.name && (
          <span className="text-red-600">{validationError.name}</span>
        )}
        <Input
          label="Отчество"
          type="text"
          name="patronymic"
          value={profile.patronymic}
          onChange={HandleInput}
          required
        />
        {validationError.patronymic && (
          <span className="text-red-600">{validationError.patronymic}</span>
        )}
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
        {error && <span className="text-red-600">{error}</span>}
        {/* Сообщение об ошибке */}
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
