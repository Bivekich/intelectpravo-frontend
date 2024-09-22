import axios from "axios";
import Input from "../../components/Input";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import React, { useState, useEffect } from "react";

const Profile = () => {
  const cookies = new Cookies();
  const token = cookies.get("token");
  const navigate = useNavigate();
  const [message, setMessage] = useState(""); // Initialize state with an empty strings
  const [confirmed, setConfirmed] = useState(false);
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
        setProfile(response.data);
        setMessage(
          response.data.isConfirmed
            ? "Профиль подтвержден"
            : 'Чтобы подтвердить профиль необходимо заполнить все поля формы "Полная информация" и все поля формы "Реквизиты"'
        );
        setConfirmed(response.data.isConfirmed);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [token]);

  const HandleInput = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    // Prepare data for the update request
    const { documentPhoto, ...profileData } = profile;
    console.log(profileData);

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
      console.log(response);
      // Optionally navigate or show a success message here
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 px-10 mx-auto py-5 border-2 rounded-2xl max-w-[400px] w-full"
    >
      <h3 className="font-semibold text-xl">Профиль пользователя</h3>

      <Input
        label="ФИО"
        type="text"
        name="fullName"
        value={profile.fullName || ""}
        onChange={HandleInput}
        required
      />
      {/* Add more Input components here for other profile fields */}

      <a
        href="/profile/confirm"
        className="rounded-xl p-2 border-2 border-[#e5e7eb] text-gray-500 transition hover:scale-105 hover:text-gray-500"
      >
        Полная Информация
      </a>
      <a
        href="/profile/bank"
        className="rounded-xl p-2 border-2 border-[#e5e7eb] text-gray-500 transition hover:scale-105 hover:text-gray-500"
      >
        Реквизиты
      </a>
      {message != "" && <span>{message}</span>}

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
    </form>
  );
};

export default Profile;
