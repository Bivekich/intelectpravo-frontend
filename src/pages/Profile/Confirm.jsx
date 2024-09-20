import React, { useState, useEffect } from "react";
import Input from "../../components/Input";
import Cookies from "universal-cookie";
import axios from "axios";

const Confirm = () => {
  const cookies = new Cookies();
  const [message, setMessage] = useState(""); // Initialize state with an empty strings
  const [profile, setProfile] = useState({
    fullName: "",
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
  const token = cookies.get("token");

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
        console.log(response);
        setMessage(
          response.data.isConfirmed
            ? "Профиль подтвержден"
            : "Чтобы подтвердить профиль необходимо заполнить все поля данной формы и все поря формы с реквизитами"
        );
        setProfile(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [token]);

  console.log(profile);

  const HandleInput = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfile((prevState) => ({
      ...prevState,
      documentPhoto: file, // Set the selected file to the state
    }));
  };

  // Format date to YYYY-MM-DD for input[type="date"]
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toISOString().split("T")[0]; // Extract date part in YYYY-MM-DD format
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    // Prepare data for the first request
    const { documentPhoto, ...profileData } = profile;
    console.log(profileData);

    try {
      // Submit profile data
      const response_ = await axios.post(
        "https://api.intelectpravo.ru/profile/update",
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response_);

      console.log(response_);
      if (typeof profile.documentPhoto == "object") {
        setMessage(response_.data.message);
        // Prepare FormData for file upload
        const formData = new FormData();
        formData.append("documentPhoto", documentPhoto);

        // Upload the file
        const fileResponse = await axios.post(
          "https://api.intelectpravo.ru/profile/upload-photo",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log(fileResponse);
        if (fileResponse.data.message === "Фото успешно загружено.") {
          // Handle success (e.g., redirect or show a message)
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 px-10 py-5 border-2 rounded-2xl max-w-[400px] w-full"
    >
      <h3 className="font-semibold text-xl">Подтверждение профиля</h3>

      <Input
        label="ФИО"
        type="text"
        name="fullName"
        value={profile.fullName || ""}
        onChange={HandleInput}
        required
      />
      <Input
        label="Почта"
        type="email"
        name="email"
        value={profile.email || ""}
        onChange={HandleInput}
        required
      />
      <Input
        label="Номер телефона"
        type="text"
        name="phoneNumber"
        value={profile.phoneNumber || ""}
        onChange={HandleInput}
        required
      />
      <Input
        label="Адрес проживания"
        type="text"
        name="address"
        value={profile.address || ""}
        onChange={HandleInput}
        required
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
      {profile.documentPhoto &&
        typeof profile.documentPhoto === "string" &&
        profile.documentPhoto !== "" && (
          <img src={profile.documentPhoto} alt="Document" />
        )}

      <Input
        label="Фотография документа"
        type="file"
        name="documentPhoto"
        accept="image/*" // Restrict file type to images
        onChange={handleFileChange}
        required={typeof profile.documentPhoto != "string"}
      />
      {message != "" && <span>{message}</span>}

      <button
        type="submit"
        className="bg-blue-600 rounded-xl text-white p-2 transition hover:scale-105"
      >
        Подтвердить профиль
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
