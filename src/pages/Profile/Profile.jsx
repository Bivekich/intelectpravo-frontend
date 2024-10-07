import axios from "axios";
import Input from "../../components/Input";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import React, { useState, useEffect } from "react";

const Profile = () => {
  const cookies = new Cookies();
  const token = cookies.get("token");
  const navigate = useNavigate();
  const [message, setMessage] = useState(""); // Initialize state with an empty string
  const [confirmed, setConfirmed] = useState(false);
  const cyrillicRegex = /^[А-ЯЁ][а-яё]+$/; // Regular expression for Cyrillic validation
  const [profile, setProfile] = useState({
    name: "",
    surname: "",
    patronymic: "",
    email: "",
    phoneNumber: "",
    birthDate: "",
    passportSeries: "",
    passportNumber: "",
    address: "",
    passportIssuedDate: "",
    passportIssuedBy: "",
    documentPhoto: null,
  });

  const [validationError, setValidationError] = useState({
    name: "",
    surname: "",
    patronymic: "",
  }); // Validation errors

  useEffect(() => {
    // Fetch profile data on component mount
    axios({
      method: "get",
      url: "https://api.intelectpravo.ru/profile/basic",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        setProfile(response.data);
        setMessage(
          response.data.isConfirmed
            ? "Профиль подтвержден"
            : 'Чтобы подтвердить профиль, необходимо заполнить все поля формы "Полная информация" и все поля формы "Реквизиты"'
        );
        setConfirmed(response.data.isConfirmed);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [token]);

  const HandleInput = (e) => {
    const { name, value } = e.target;

    // Validate name, surname, and patronymic fields
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

    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    // Check for validation errors
    if (Object.values(validationError).some((msg) => msg !== "")) {
      setMessage("Пожалуйста, исправьте ошибки в форме.");
      return;
    }

    // Prepare data for the update request
    const { documentPhoto, ...profileData } = profile;

    try {
      // Submit profile data
      const response = await axios.post(
        "https://api.intelectpravo.ru/profile/update",
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      cookies.remove("token", { path: "/" });
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const relogin = () => {
    cookies.remove("email", { path: "/" });
    cookies.remove("token", { path: "/" });
    navigate("/");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 px-10 mx-auto py-5 border-2 rounded-2xl max-w-[400px] w-full"
    >
      <h3 className="font-semibold text-xl">Профиль пользователя</h3>

      <Input
        label="Фамилия"
        type="text"
        name="surname"
        value={profile.surname || ""}
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
        value={profile.name || ""}
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
        value={profile.patronymic || ""}
        onChange={HandleInput}
      />
      {validationError.patronymic && (
        <span className="text-red-600">{validationError.patronymic}</span>
      )}

      {/* Add more Input components here for other profile fields */}

      <a
        href="/profile/confirm"
        className="rounded-xl p-2 border-2 border-[#e5e7eb] text-gray-500 transition hover:scale-105 hover:text-gray-500"
      >
        Редактировать учетную запись
      </a>
      <a
        href="/profile/bank"
        className="rounded-xl p-2 border-2 border-[#e5e7eb] text-gray-500 transition hover:scale-105 hover:text-gray-500"
      >
        Реквизиты
      </a>
      <a
        href="/profile/changepass"
        className="rounded-xl p-2 border-2 border-[#e5e7eb] text-gray-500 transition hover:scale-105 hover:text-gray-500"
      >
        Изменить пароль
      </a>
      <a
        href="/profile/changemail"
        className="rounded-xl p-2 border-2 border-[#e5e7eb] text-gray-500 transition hover:scale-105 hover:text-gray-500"
      >
        Изменить почту
      </a>

      {message && <span>{message}</span>}

      <button
        type="submit"
        className="bg-blue-600 rounded-xl text-white transition hover:scale-105"
      >
        Сохранить изменения
      </button>

      <a
        href="/"
        className="bg-gray-300 text-gray-600 rounded-xl text-white p-2 transition hover:scale-105 hover:text-gray-600"
      >
        Назад
      </a>

      <button
        type="button"
        onClick={relogin}
        className="bg-red-600 rounded-xl text-white transition hover:scale-105"
      >
        Выйти
      </button>
    </form>
  );
};

export default Profile;
