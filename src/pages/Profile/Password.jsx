import React, { useState } from "react";
import Input from "../../components/Input"; // Assuming you have an Input component
import axios from "axios";
import Cookies from "universal-cookie";
import md5 from "md5";

const Password = () => {
  const cookies = new Cookies();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); // For success message

  // Функция для валидации нового пароля
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Проверка пароля на лету при изменении поля "newPassword"
    if (name === "newPassword") {
      const errors = validatePassword(value);
      setPasswordErrors(errors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Проверяем, совпадают ли новые пароли
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Новые пароли не совпадают");
      return;
    }

    // Проверяем наличие ошибок в пароле
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join(" "));
      return;
    }

    setError(""); // Очистить предыдущие ошибки

    try {
      const token = cookies.get("token");
      const response = await axios.post(
        "https://api.intelectpravo.ru/profile/change-password", // Измените URL на свой
        {
          currentPassword: md5(passwordData.currentPassword),
          newPassword: md5(passwordData.newPassword),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setMessage("Пароль успешно изменен!");
        setError("");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }); // Очистить поля
      }
    } catch (error) {
      console.error("Ошибка при изменении пароля:", error);
      setMessage("");
      setError("Произошла ошибка при изменении пароля.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 px-10 py-5 border-2 rounded-2xl max-w-[500px] w-full"
    >
      <h3 className="font-semibold text-xl">Изменение пароля</h3>
      <Input
        label="Текущий пароль"
        type="password"
        name="currentPassword"
        value={passwordData.currentPassword}
        onChange={handleInputChange}
        required
      />
      <Input
        label="Новый пароль"
        type="password"
        name="newPassword"
        value={passwordData.newPassword}
        onChange={handleInputChange}
        required
      />
      {/* Валидация пароля в реальном времени */}
      {passwordErrors.length > 0 && (
        <ul className="text-red-600">
          {passwordErrors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      )}
      <Input
        label="Подтвердите пароль"
        type="password"
        name="confirmPassword"
        value={passwordData.confirmPassword}
        onChange={handleInputChange}
        required
      />
      {error && <span className="text-red-600">{error}</span>}{" "}
      {/* Сообщение об ошибке */}
      {message && <span className="text-green-600">{message}</span>}{" "}
      {/* Сообщение об успешном изменении */}
      <button
        type="submit"
        className="bg-blue-600 rounded-xl text-white transition hover:scale-105"
      >
        Изменить пароль
      </button>
    </form>
  );
};

export default Password;
