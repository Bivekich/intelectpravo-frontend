import React, { useState, useEffect } from "react";
import axios from "axios";
import Input from "../../components/Input";
import AlertModal from "../../components/AlertModal"; // Import the new AlertModal component
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";

const Auth = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    login: "+7", // Automatically set the default value to +7
  });
  const [errorMessage, setErrorMessage] = useState(""); // For validation errors
  const [isButtonDisabled, setIsButtonDisabled] = useState(true); // Button state
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const cookies = new Cookies();

  useEffect(() => {
    if (!cookies.get("page")) {
      cookies.set("page", "/auth", { path: "/" });
    }
  }, []);

  const handleInput = (e) => {
    let { name, value } = e.target;

    // Remove any non-numeric characters (including letters) from the input
    value = value.replace(/[^0-9]/g, ""); // Remove anything that isn't a digit

    // Automatically prepend +7 if not present and format accordingly
    if (!value.startsWith("7") && value.length > 0) {
      value = "+7" + value.slice(1); // Ensure it starts with +7
    } else {
      value = "+7" + value.slice(1); // Always start with +7
    }

    // Limit the input to +7 followed by 10 digits (12 characters in total)
    if (value.length > 12) {
      value = value.slice(0, 12);
    }

    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));

    // Validate the phone number on every input change
    if (validatePhone(value)) {
      setErrorMessage("");
      setIsButtonDisabled(false);
    } else {
      setErrorMessage("Введите корректный номер телефона");
      setIsButtonDisabled(true);
    }
  };

  const validatePhone = (login) => {
    const phoneRegex = /^\+7[0-9]{10}$/; // Validate the phone number format (10 digits after +7)

    // Check if phone matches the basic format
    if (!phoneRegex.test(login)) {
      return false;
    }

    // Check for sequences of identical digits (e.g., +71111111111)
    const repeatedPattern = /(\d)\1{9}/; // Matches 10 repeated digits
    if (repeatedPattern.test(login)) {
      return false;
    }

    // Check for common invalid patterns (e.g., +70000000000)
    const invalidPatterns = [
      "+70000000000",
      "+71111111111",
      "+72222222222",
      "+73333333333",
      "+74444444444",
      "+75555555555",
      "+76666666666",
      "+77777777777",
      "+78888888888",
      "+79999999999",
      "+71234567890",
      "+70987654321",
    ];
    if (invalidPatterns.includes(login)) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    // Validate phone number
    if (!validatePhone(profile.login)) {
      setErrorMessage("Введите корректный номер телефона");
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
          cookies.remove("page");

          navigate("/loginbypass");
        }
      })
      .catch(function (error) {
        if (error.response && error.response.status === 404) {
          // Show modal when the account doesn't exist
          setShowModal(true);
        } else {
          console.error("Произошла ошибка:", error);
        }
      });
  };

  const handleConfirm = () => {
    // "Да" button click handler - navigate to registration
    cookies.set("login", profile.login, { path: "/" });
    navigate("/signin");
    setShowModal(false);
  };

  const handleCancel = () => {
    // "Нет" button click handler - just close the modal
    setShowModal(false);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 px-10 py-5 border-2 rounded-2xl max-w-[400px] w-full"
      >
        <h3 className="font-semibold text-xl">Вход в личный кабинет</h3>
        <Input
          label="Введите номер телефона"
          type="tel"
          name="login"
          value={profile.login}
          onChange={handleInput}
          required
        />

        {errorMessage && <div className="text-red-500">{errorMessage}</div>}

        <button
          type="submit"
          className={`rounded-xl text-white transition hover:scale-105 ${
            isButtonDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600"
          }`}
          disabled={isButtonDisabled}
        >
          Вход
        </button>
      </form>

      {/* Render the modal only when showModal is true */}
      {showModal && (
        <AlertModal
          title="Уведомление от администратора платформы intelectpravo.ru"
          message="Учётной записи по указанному номеру не существует. Хотите создать учётную запись?"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};

export default Auth;
