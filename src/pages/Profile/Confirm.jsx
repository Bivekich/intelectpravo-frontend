import React, { useState, useEffect } from "react";
import Input from "../../components/Input";
import Cookies from "universal-cookie";
import axios from "axios";
import AcceptAll from "../../components/AcceptAll";
import { useNavigate } from "react-router-dom";
// Время жизни данных в миллисекундах (5 минут = 300000 мс)
const EXPIRATION_TIME = 300000; // 5 минут

const saveToLocalStorage = (key, value) => {
  const expiration = Date.now() + EXPIRATION_TIME;
  const data = {
    value,
    expiration,
  };
  localStorage.setItem(key, JSON.stringify(data));
};

const getFromLocalStorage = (key) => {
  const storedData = localStorage.getItem(key);
  if (!storedData) return null;

  const { value, expiration } = JSON.parse(storedData);
  if (Date.now() > expiration) {
    localStorage.removeItem(key);
    return null;
  }

  return value;
};

const Confirm = () => {
  const cookies = new Cookies();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [error, setError] = useState(""); // Для вывода ошибок (например, превышение размера файла)
  const [profile, setProfile] = useState({
    name: "",
    surname: "",
    patronymic: "",
    email: "",
    phoneNumber: "",
    birthDate: "",
    passportSeries: "",
    passportNumber: "",
    passportCode: "",
    address: "", // Объединенный адрес
    passportIssuedDate: "",
    passportIssuedBy: "",
    documentPhoto: null,
  });
  const token = cookies.get("token");

  useEffect(() => {
    const savedProfile = getFromLocalStorage("profileData");
    if (savedProfile) {
      setProfile(savedProfile);
    } else {
      axios({
        method: "get",
        url: "http://localhost:3000/profile/basic",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          setMessage(
            response.data.isConfirmed
              ? "Профиль подтвержден"
              : "Чтобы подтвердить профиль, необходимо заполнить все поля данной формы и все поля формы с реквизитами"
          );
          setProfile(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [token]);

  const HandleInput = (e) => {
    const { name, value } = e.target;
    const updatedProfile = {
      ...profile,
      [name]: value,
    };
    setProfile(updatedProfile);
    saveToLocalStorage("profileData", updatedProfile);
  };

  const handlePhoneChange = (e) => {
    const phone = e.target.value.replace(/\D/g, ""); // Убираем все, кроме цифр
    if (phone.length <= 11) {
      setProfile((prevProfile) => ({
        ...prevProfile,
        phoneNumber: "+7" + phone.slice(1), // Автоматически добавляем +7
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
      setError("Размер файла не должен превышать 2 МБ");
    } else {
      setError(""); // Убираем ошибку
      const updatedProfile = {
        ...profile,
        documentPhoto: file,
      };
      setProfile(updatedProfile);
      saveToLocalStorage("profileData", updatedProfile);
    }
  };

  const removePhoto = () => {
    const updatedProfile = {
      ...profile,
      documentPhoto: null,
    };
    setProfile(updatedProfile);
    saveToLocalStorage("profileData", updatedProfile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { documentPhoto, ...profileData } = profile;

    try {
      const response_ = await axios.post(
        "http://localhost:3000/profile/update",
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (typeof profile.documentPhoto === "object") {
        setMessage(response_.data.message);
        const formData = new FormData();
        formData.append("documentPhoto", documentPhoto);

        const fileResponse = await axios.post(
          "http://localhost:3000/profile/upload-photo",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log(fileResponse);

        cookies.remove("token", { path: "/" });

        // Redirect to the homepage
        navigate("/"); // This will redirect the user to the homepage
      }
    } catch (error) {
      console.log(error);
    }
  };

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toISOString().split("T")[0];
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 px-10 py-5 border-2 rounded-2xl max-w-[600px] w-full"
    >
      <h3 className="font-semibold text-xl">Подтверждение профиля</h3>
      <Input
        label="Фамилия"
        type="text"
        name="surname"
        value={profile.surname || ""}
        onChange={HandleInput}
        required
      />
      <Input
        label="Имя"
        type="text"
        name="name"
        value={profile.name || ""}
        onChange={HandleInput}
        required
      />
      <Input
        label="Отчество"
        type="text"
        name="patronymic"
        value={profile.patronymic || ""}
        onChange={HandleInput}
      />
      <Input
        label="Номер телефона"
        type="text"
        name="phoneNumber"
        value={profile.phoneNumber || ""}
        onChange={handlePhoneChange}
        required
        placeholder="+7XXXXXXXXXX" // Подсказка для пользователя
      />
      <label htmlFor="">Адрес (Индекс, Город, Улица, Дом, Квартира)</label>
      <Input
        label="Адрес"
        type="text"
        name="address"
        value={profile.address || ""}
        onChange={HandleInput}
        required
        placeholder="Например: 123456, Город, Улица, 10, 5" // Подсказка для пользователя
      />
      <Input
        label="Дата рождения"
        type="date"
        name="birthDate"
        value={formatDateForInput(profile.birthDate) || ""}
        onChange={HandleInput}
        required
      />
      <Input
        label="Серия паспорта"
        type="text"
        name="passportSeries"
        value={profile.passportSeries || ""}
        onChange={HandleInput}
        required
      />
      <Input
        label="Номер паспорта"
        type="text"
        name="passportNumber"
        value={profile.passportNumber || ""}
        onChange={HandleInput}
        required
      />
      <Input
        label="Код подразделения"
        type="text"
        name="passportCode"
        value={profile.passportCode || ""}
        onChange={HandleInput}
        required
      />
      <Input
        label="Когда выдан"
        type="date"
        name="passportIssuedDate"
        value={formatDateForInput(profile.passportIssuedDate) || ""}
        onChange={HandleInput}
      />
      <Input
        label="Кем выдан"
        type="text"
        name="passportIssuedBy"
        value={profile.passportIssuedBy || ""}
        onChange={HandleInput}
      />
      {profile.documentPhoto && (
        <div className="flex flex-col gap-3">
          {typeof profile.documentPhoto === "string" ? (
            <img src={profile.documentPhoto} alt="Uploaded Document" />
          ) : (
            <p>{profile.documentPhoto.name}</p>
          )}
          <button
            type="button"
            onClick={removePhoto}
            className="bg-red-500 text-white rounded-lg p-2"
          >
            Удалить фото
          </button>
        </div>
      )}
      {!profile.documentPhoto && (
        <Input
          label="Фотография документа"
          type="file"
          name="documentPhoto"
          accept="image/*"
          onChange={handleFileChange}
          required
        />
      )}
      <AcceptAll name="accept" />
      {error && <span className="text-red-600">{error}</span>}{" "}
      {/* Вывод ошибки */}
      {message && <span>{message}</span>}
      <button
        type="submit"
        className="bg-blue-600 rounded-xl text-white p-2 transition hover:scale-105"
      >
        {profile.isConfirmed ? "Сохранить" : "Подтвердить профиль"}
      </button>
      <a
        href="/profile"
        className="bg-gray-300 text-gray-600 rounded-xl text-white p-2 transition hover:scale-105 hover:text-gray-600"
      >
        Назад
      </a>
    </form>
  );
};

export default Confirm;
