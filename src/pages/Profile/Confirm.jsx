import React, { useState, useEffect, useRef } from "react";
import Input from "../../components/Input";
import Cookies from "universal-cookie";
import axios from "axios";
import AlertModal from "../../components/AlertModal"; // Import the new AlertModal component

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

  // Return null if there's no data
  if (!storedData) return null;

  try {
    // Parse the stored data
    const { value, expiration } = JSON.parse(storedData);

    // Check for expiration
    if (Date.now() > expiration) {
      localStorage.removeItem(key);
      return null;
    }

    return value;
  } catch (error) {
    console.error(`Error parsing localStorage data for key "${key}":`, error);
    localStorage.removeItem(key); // Optionally, remove invalid data
    return null;
  }
};

const Confirm = () => {
  const cookies = new Cookies();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [inoy, setInoy] = useState(false);
  const [error, setError] = useState(""); // Для вывода ошибок (например, превышение размера файла)
  const [validationErrors, setValidationErrors] = useState({});
  const [showModalBack, setShowModalBack] = useState(false);
  const [showModalSave, setShowModalSave] = useState(false);
  const formRef = useRef(null);
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
    address: "",
    passportIssuedDate: "",
    passportIssuedBy: "",
    inoy: "",
    documentPhoto: null,
  });
  const [originalProfile, setOriginalProfile] = useState(null); // Исходные данные для сравнения
  const [isButtonEnabled, setIsButtonEnabled] = useState(false); // Состояние кнопки
  const token = cookies.get("token");

  useEffect(() => {
    const savedProfile = getFromLocalStorage("profileData");
    if (savedProfile) {
      setProfile(savedProfile);
      setOriginalProfile(savedProfile);
    } else {
      axios({
        method: "get",
        url: "https://api.intelectpravo.ru/profile/basic",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          setMessage(
            response.data.isConfirmed
              ? "Подтвержденная учётная запись"
              : "Чтобы подтвердить профиль, необходимо заполнить все поля данной формы и все поля формы с реквизитами",
          );
          setProfile(response.data);
          if (response.data.inoy) {
            setInoy(true);
          } else {
            setInoy(false);
          }
        })
        .catch((error) => {
          console.log(error);
        });
      setOriginalProfile({});
    }
  }, [token]);

  useEffect(() => {
    if (originalProfile) {
      const isProfileChanged =
        JSON.stringify(profile) !== JSON.stringify(originalProfile);
      setIsButtonEnabled(isProfileChanged); // Activates button if data is changed
    }
    // console.log(originalProfile);
  }, [profile, originalProfile]);

  const validateForm = () => {
    const errors = {};
    const cyrillicRegex = /^[А-ЯЁ][а-яё]+$/;
    const phoneRegex = /^\+7\d{10}$/;
    const emailRegex =
      /^[A-Za-z0-9._%+-]{1,30}@[A-Za-z0-9.-]{1,30}\.[A-Za-z]{1,5}$/;
    const issuedByRegex = /^[А-ЯЁа-яё\s-]+$/; // Разрешаем только кириллицу, пробелы, точки, запятые и тире
    const minYear = 1900;

    const validateYear = (dateStr) => {
      const year = new Date(dateStr).getFullYear();
      return year >= minYear && new Date(dateStr) <= new Date(); // Проверка на будущее
    };

    // Validate each field
    if (!profile.surname || !cyrillicRegex.test(profile.surname)) {
      errors.surname =
        "Фамилия должна быть на кириллице и начинаться с заглавной буквы";
    }

    if (!profile.name || !cyrillicRegex.test(profile.name)) {
      errors.name =
        "Имя должно быть на кириллице и начинаться с заглавной буквы";
    }

    if (profile.patronymic && !cyrillicRegex.test(profile.patronymic)) {
      errors.patronymic =
        "Отчество должно быть на кириллице и начинаться с заглавной буквы";
    }

    if (!phoneRegex.test(profile.phoneNumber)) {
      errors.phoneNumber = "Введите корректный адрес электронной почты";
    }

    if (!profile.address) {
      errors.address = "Адрес обязателен для заполнения";
    }

    if (!inoy) {
      if (!profile.passportSeries || profile.passportSeries.length !== 4) {
        errors.passportSeries = "Серия паспорта должна содержать 4 цифры";
      }

      if (!profile.passportNumber || profile.passportNumber.length !== 6) {
        errors.passportNumber = "Номер паспорта должен содержать 6 цифр";
      }
      if (
        !profile.passportCode ||
        !/^\d{3}-\d{3}$/.test(profile.passportCode)
      ) {
        errors.passportCode =
          "Код подразделения должен содержать 6 цифр и тире (формат: 123-456)";
      }
      if (!profile.passportIssuedDate) {
        errors.passportIssuedDate = "Дата выдачи паспорта обязательна";
      } else if (!validateYear(profile.passportIssuedDate)) {
        errors.passportIssuedDate = `Дата выдачи паспорта должна быть не ранее ${minYear} и не в будущем.`;
      }

      if (!profile.passportIssuedBy) {
        errors.passportIssuedBy = "Информация о выдаче паспорта обязательна";
      } else if (!issuedByRegex.test(profile.passportIssuedBy)) {
        errors.passportIssuedBy =
          "Поле 'Кем выдан' может содержать только кириллицу, пробелы и тире.";
      }
    }

    if (!profile.birthDate) {
      errors.birthDate = "Дата рождения обязательна";
    } else if (!validateYear(profile.birthDate)) {
      errors.birthDate = `Год рождения должен быть не ранее ${minYear} и не в будущем.`;
    }

    if (!profile.documentPhoto) {
      errors.documentPhoto = "Загрузка фотографии документа обязательна";
    }

    if (!profile.email || !emailRegex.test(profile.email)) {
      errors.email = "Некорректный формат email";
    }

    return errors;
  };

  const handleNumericInput = (e) => {
    const { name, value } = e.target;
    // Убираем все, кроме цифр
    let numericValue = value.replace(/[^\d]/g, "");

    // Максимальная длина для каждого поля
    const maxLengths = {
      passportSeries: 4,
      passportNumber: 6,
      passportCode: 7,
    };

    // Ограничиваем длину вводимого значения
    if (maxLengths[name]) {
      numericValue = numericValue.slice(0, maxLengths[name]);
    }
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: numericValue,
    }));
  };
  const handleNumericInputCode = (e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^\d-]/g, ""); // Убираем все, кроме цифр

    // Обновляем состояние
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: numericValue.length > 7 ? numericValue.slice(0, 7) : numericValue,
    }));
  };

  const HandleInput = (e) => {
    const { name, value } = e.target;

    // Check if the input value length exceeds 50 characters
    let limitedValue;
    if (name == "address") {
      limitedValue = value.length > 100 ? value.slice(0, 100) : value;
    } else if (name == "passportIssuedBy") {
      limitedValue = value.length > 100 ? value.slice(0, 100) : value;
    } else if (name == "email") {
      limitedValue = value.length > 70 ? value.slice(0, 70) : value;
    } else {
      limitedValue = value.length > 22 ? value.slice(0, 22) : value;
    }

    const updatedProfile = {
      ...profile,
      [name]: limitedValue,
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
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setValidationErrors(validationErrors);
      setMessage("Пожалуйста, исправьте ошибки в форме.");
      return;
    }

    setShowModalSave(!showModalSave);
  };

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toISOString().split("T")[0];
  };

  const handleConfirmSubmit = async () => {
    if (inoy) {
      setProfile((prevProfile) => ({
        ...prevProfile,
        passportSeries: "",
        passportCode: "",
        passportNumber: "",
        passportIssuedDate: "",
        passportIssuedBy: "",
      }));
    }
    const { documentPhoto, ...profileData } = profile;

    try {
      console.log(profileData);
      console.log(documentPhoto);

      // Set phone number in cookies
      cookies.set("phone", profile.phoneNumber, { path: "/" });
      // Navigate to confirmation page
      const updateResponse = await axios.post(
        "https://api.intelectpravo.ru/profile/update",
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log(updateResponse);
      // If documentPhoto is an object (likely a file), convert it to a string format for localStorage
      if (typeof documentPhoto === "object") {
        const formData = new FormData();

        formData.append("documentPhoto", documentPhoto);

        const huy = await axios.post(
          "https://api.intelectpravo.ru/profile/upload-photo",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );
        console.log(huy);
      }
      navigate("/profile/?info=1");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 px-10 py-5 border-2 rounded-2xl max-w-[600px] w-full"
      >
        <h3 className="font-semibold text-xl">
          Редактирование паспортных и контактных данных
        </h3>
        <p>
          Сохранено{" "}
          {new Date(profile.updatedAt).toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
          г в{" "}
          {new Date(profile.updatedAt).toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        <Input
          label="Электронная почта"
          type="email"
          name="email"
          value={profile.email}
          onChange={HandleInput}
          required
        />
        {validationErrors.email && (
          <span className="text-red-600">{validationErrors.email}</span>
        )}

        <Input
          label="Фамилия"
          type="text"
          name="surname"
          value={profile.surname || ""}
          onChange={HandleInput}
          required
        />
        {validationErrors.surname && (
          <span className="text-red-600">{validationErrors.surname}</span>
        )}

        <Input
          label="Имя"
          type="text"
          name="name"
          value={profile.name || ""}
          onChange={HandleInput}
          required
        />
        {validationErrors.name && (
          <span className="text-red-600">{validationErrors.name}</span>
        )}

        <Input
          label="Отчество"
          type="text"
          name="patronymic"
          value={profile.patronymic || ""}
          onChange={HandleInput}
        />
        {validationErrors.patronymic && (
          <span className="text-red-600">{validationErrors.patronymic}</span>
        )}

        <Input
          label="Номер телефона"
          type="text"
          name="phoneNumber"
          value={profile.phoneNumber || ""}
          onChange={handlePhoneChange}
          required
          placeholder="+7XXXXXXXXXX"
        />
        {validationErrors.phoneNumber && (
          <span className="text-red-600">{validationErrors.phoneNumber}</span>
        )}

        <Input
          label="Адрес"
          type="text"
          name="address"
          value={profile.address || ""}
          onChange={HandleInput}
          required
          maxLength={280}
          placeholder="Например: 123456, Город, Улица, 10, 5"
        />
        {validationErrors.address && (
          <span className="text-red-600">{validationErrors.address}</span>
        )}

        <Input
          label="Дата рождения"
          type="date"
          name="birthDate"
          value={formatDateForInput(profile.birthDate) || ""}
          onChange={HandleInput}
          required
        />
        {validationErrors.birthDate && (
          <span className="text-red-600">{validationErrors.birthDate}</span>
        )}
        {!inoy ? (
          <>
            <Input
              label="Серия паспорта"
              type="text"
              name="passportSeries"
              value={profile.passportSeries || ""}
              onChange={handleNumericInput} // Изменение обработчика
              required
            />
            {validationErrors.passportSeries && (
              <span className="text-red-600">
                {validationErrors.passportSeries}
              </span>
            )}

            <Input
              label="Номер паспорта"
              type="text"
              name="passportNumber"
              value={profile.passportNumber || ""}
              onChange={handleNumericInput} // Изменение обработчика
              required
            />
            {validationErrors.passportNumber && (
              <span className="text-red-600">
                {validationErrors.passportNumber}
              </span>
            )}

            <Input
              label="Код подразделения"
              type="text"
              name="passportCode"
              value={profile.passportCode || ""}
              onChange={handleNumericInputCode} // Изменение обработчика
              required
            />
            {validationErrors.passportCode && (
              <span className="text-red-600">
                {validationErrors.passportCode}
              </span>
            )}

            <Input
              label="Когда выдан"
              type="date"
              name="passportIssuedDate"
              value={formatDateForInput(profile.passportIssuedDate) || ""}
              onChange={HandleInput}
            />
            {validationErrors.passportIssuedDate && (
              <span className="text-red-600">
                {validationErrors.passportIssuedDate}
              </span>
            )}

            <Input
              label="Кем выдан"
              type="text"
              name="passportIssuedBy"
              value={profile.passportIssuedBy || ""}
              onChange={HandleInput}
            />
            {validationErrors.passportIssuedBy && (
              <span className="text-red-600">
                {validationErrors.passportIssuedBy}
              </span>
            )}
          </>
        ) : (
          <>
            <Input
              label="Иное"
              type="text"
              name="inoy"
              value={profile.inoy || ""}
              maxLength={100}
              onChange={HandleInput}
            />
          </>
        )}
        <label>
          <input
            type="checkbox"
            onChange={() => setInoy(!inoy)}
            checked={inoy}
          />{" "}
          Иное
        </label>
        {profile.documentPhoto && (
          <div className="flex flex-col gap-3">
            {typeof profile.documentPhoto === "string" ? (
              <>
                <span>Фото документа, удостоверяющего личность</span>
                <img src={profile.documentPhoto} alt="Uploaded Document" />
              </>
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
            accept=".png, .jpg, .jpeg"
            onChange={handleFileChange}
            required
          />
        )}
        {validationErrors.documentPhoto && (
          <span className="text-red-600">{validationErrors.documentPhoto}</span>
        )}

        {/* <AcceptAll name="accept" /> */}
        {error && <span className="text-red-600">{error}</span>}
        {message && <span>{message}</span>}

        <button
          type="submit"
          className={`py-2 px-4 rounded-xl ${isButtonEnabled ? "bg-blue-600" : "bg-gray-400"} text-white`}
          disabled={!isButtonEnabled}
        >
          {profile.isConfirmed ? "Сохранить данные" : "Сохранить данные"}
        </button>
        <button
          type="button"
          onClick={() => {
            isButtonEnabled
              ? setShowModalBack(!showModalBack)
              : navigate("/profile");
          }}
          className="bg-gray-400 text-gray-500 rounded-xl text-white p-2 transition hover:scale-105 hover:text-gray-600"
        >
          Вернуться в меню учётной записи
        </button>
      </form>
      {showModalBack && (
        <AlertModal
          title="Данные были изменены. Выйти без сохранения?"
          message=""
          onConfirm={() => navigate("/profile")}
          onCancel={() => setShowModalBack(!showModalBack)}
        />
      )}
      {showModalSave && (
        <AlertModal
          title="Вы точно хотите сохранить данные?"
          message=""
          onConfirm={handleConfirmSubmit}
          onCancel={() => setShowModalSave(!showModalSave)}
        />
      )}
    </>
  );
};

export default Confirm;
