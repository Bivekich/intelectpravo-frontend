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
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  useEffect(() => {
    if (!cookies.get("page")) {
      cookies.set("page", "/signin", { path: "/" });
    }
  }, []);

  const [profile, setProfile] = useState({
    name: "",
    surname: "",
    patronymic: "",
    phone:
      cookies.get("phone") ||
      (phoneRegex.test(cookies.get("login")) ? cookies.get("login") : ""),
    password: "",
    confirmPassword: "",
    email: "",
  });

  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState({
    name: "",
    surname: "",
    patronymic: "",
  });

  const [passwordValidation, setPasswordValidation] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
            "Поле должно начинаться с заглавной буквы и содержать только кириллицу.",
        }));
      } else {
        setValidationError((prevErrors) => ({
          ...prevErrors,
          [name]: "",
        }));
      }
    }

    if (name === "email" && value.length <= 100 && !emailRegex.test(value)) {
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

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    cookies.remove("page");

    // Validate the form
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

    try {
      // Check if the phone is already registered
      const loginResponse = await axios.post(
        "http://localhost:3030/auth/login",
        {
          login: profile.phone,
        }
      );

      if (loginResponse.status === 200) {
        setError("Пользователь с этим номером телефона уже зарегистрирован");

        if (
          confirm(
            "Пользователь с этим номером телефона уже зарегистрирован. Войти?"
          )
        ) {
          navigate("/auth");
        }
        return;
      }
    } catch (loginError) {
      // If the phone number is not registered (404), proceed with registration
      if (loginError.response && loginError.response.status === 404) {
        try {
          // Register the new user
          const registerResponse = await axios.post(
            "http://localhost:3030/auth/register",
            {
              phone: profile.phone,
              name: profile.name,
              surname: profile.surname,
              patronymic: profile.patronymic,
              password: md5(profile.password),
              email: profile.email,
            }
          );

          if (registerResponse.status === 200) {
            localStorage.removeItem("draftProfile");
            cookies.set("phone", profile.phone, { path: "/" });
            navigate("/signup");
          }
        } catch (registerError) {
          console.error("Произошла ошибка при регистрации:", registerError);
        }
      } else {
        console.error(
          "Произошла ошибка при проверке номера телефона:",
          loginError
        );
      }
    }
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
        <div className="relative">
          <Input
            label="Придумайте пароль"
            type={showPassword ? "text" : "password"}
            name="password"
            value={profile.password}
            onChange={handleInput}
            required
            maxLength={22}
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            className="absolute right-0 top-1/2 transform bg-transparent -translate-y-1/2 text-blue-500 border-0"
            aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"} // Accessibility
          >
            {showPassword ? (
              // Eye Slash SVG
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
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            ) : (
              // Eye SVG
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
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M12.0012 5C7.52354 5 3.73326 7.94288 2.45898 12C3.73324 16.0571 7.52354 19 12.0012 19C16.4788 19 20.2691 16.0571 21.5434 12C20.2691 7.94291 16.4788 5 12.0012 5Z"
                  stroke="#535bf2"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
        {passwordValidation && (
          <span className="text-red-600">{passwordValidation}</span>
        )}
        <Input
          label="Подтвердите пароль"
          type={showPassword ? "text" : "password"}
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
