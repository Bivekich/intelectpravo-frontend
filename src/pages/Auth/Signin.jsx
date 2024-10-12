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
  const phoneRegex = /^\+?[1-9]\d{1,14}$/; // Регулярное выражение для валидации телефона
  const cyrillicRegex = /^[А-ЯЁ][а-яё]+$/; // Регулярное выражение для валидации кириллицы
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Регулярное выражение для валидации email

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

    // Установка максимальных символов для каждого поля
    const maxLength = {
      phone: 22,
      name: 22,
      surname: 22,
      patronymic: 22,
      password: 22,
      confirmPassword: 22,
      email: 100,
    };

    // Проверка длины значения перед обновлением состояния
    if (value.length > maxLength[name]) {
      return; // Не обновляем состояние, если превышен лимит
    }

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

    // Email validation
    if (name === "email" && !emailRegex.test(value)) {
      setError("Неверный формат email.");
    } else {
      setError("");
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
      url: "http://localhost:3000/auth/register",
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
          // Очищаем черновик после успешной регистрации
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
          label="Телефон" // Изменено на "Телефон"
          type="tel" // Изменен тип на "tel"
          name="phone" // Изменено на "phone"
          value={profile.phone} // Изменено на "phone"
          onChange={HandleInput}
          readOnly={
            cookies.get("phone") ||
            (phoneRegex.test(cookies.get("login")) ? cookies.get("login") : "")
          }
          required
          maxLength={22} // Установлено ограничение в 22 символа
        />
        <Input
          label="Email"
          type="email"
          name="email"
          value={profile.email}
          onChange={HandleInput}
          required
          maxLength={100} // Установлено ограничение в 100 символов
        />
        <Input
          label="Фамилия"
          type="text"
          name="surname"
          value={profile.surname}
          onChange={HandleInput}
          required
          maxLength={22} // Установлено ограничение в 22 символа
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
          maxLength={22} // Установлено ограничение в 22 символа
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
          maxLength={22} // Установлено ограничение в 22 символа
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
          maxLength={22} // Установлено ограничение в 22 символа
        />
        <Input
          label="Подтвердите пароль"
          type="password"
          name="confirmPassword"
          value={profile.confirmPassword}
          onChange={HandleInput}
          required
          maxLength={22} // Установлено ограничение в 22 символа
        />
        {error && <span className="text-red-600">{error}</span>}
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
