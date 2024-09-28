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
  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); // For success message

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password confirmation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Новые пароли не совпадают");
      return;
    }

    setError(""); // Clear any previous errors

    try {
      const token = cookies.get("token");
      const response = await axios.post(
        "http://localhost:3000/profile/change-password", // Change URL to your endpoint
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
        }); // Clear fields
        console.log(response);
      }
    } catch (error) {
      console.error("Error changing password:", error);
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
      <Input
        label="Подтвердитпе пароль"
        type="password"
        name="confirmPassword"
        value={passwordData.confirmPassword}
        onChange={handleInputChange}
        required
      />
      {error && <span className="text-red-600">{error}</span>}{" "}
      {/* Error message */}
      {message && <span className="text-green-600">{message}</span>}{" "}
      {/* Success message */}
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
