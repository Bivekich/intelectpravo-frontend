import axios from "axios";
import Input from "../../components/Input";
import { useNavigate, Link } from "react-router-dom";
import Cookies from "universal-cookie";
import React, { useState, useEffect } from "react";

const Profile = () => {
  const cookies = new Cookies();
  const token = cookies.get("token");
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [confirmed, setConfirmed] = useState(false);

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

  const [payments, setPayments] = useState({
    cardNumber: "",
    accountNumber: "",
    corrAccount: "",
    bic: "",
  });

  useEffect(() => {
    // Fetch profile data
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
            : 'Чтобы подтвердить профиль, необходимо заполнить все поля формы "Полная информация" и все поля формы "Реквизиты", после их заполнения Ваш профиль будет направлен администратору сайта на проверку'
        );
        setConfirmed(response.data.isConfirmed);
      })
      .catch((error) => {
        console.log(error);
      });

    // Fetch bank details data
    axios({
      method: "get",
      url: "https://api.intelectpravo.ru/profile/bank-details",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        setPayments(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [token]);

  const relogin = () => {
    cookies.remove("email", { path: "/" });
    cookies.remove("token", { path: "/" });
    navigate("/");
  };

  return (
    <form className="flex flex-col gap-5 px-10 mx-auto py-5 border-2 rounded-2xl max-w-[400px] w-full">
      <h3 className="font-semibold text-xl">Профиль пользователя</h3>

      {/* Profile Information */}
      {profile.email && (
        <Input
          label="Email"
          type="email"
          name="email"
          value={profile.email}
          readOnly
        />
      )}

      {profile.surname && (
        <Input
          label="Фамилия"
          type="text"
          name="surname"
          value={profile.surname}
          readOnly
        />
      )}

      {profile.name && (
        <Input
          label="Имя"
          type="text"
          name="name"
          value={profile.name}
          readOnly
        />
      )}

      {profile.patronymic && (
        <Input
          label="Отчество"
          type="text"
          name="patronymic"
          value={profile.patronymic}
          readOnly
        />
      )}

      {profile.phoneNumber && (
        <Input
          label="Номер телефона"
          type="text"
          name="phoneNumber"
          value={profile.phoneNumber}
          readOnly
        />
      )}

      {profile.address && (
        <Input
          label="Адрес"
          type="text"
          name="address"
          value={profile.address}
          readOnly
        />
      )}

      {profile.birthDate && (
        <Input
          label="Дата рождения"
          type="date"
          name="birthDate"
          value={profile.birthDate}
          readOnly
        />
      )}

      {profile.passportSeries && (
        <Input
          label="Серия паспорта"
          type="text"
          name="passportSeries"
          value={profile.passportSeries}
          readOnly
        />
      )}

      {profile.passportNumber && (
        <Input
          label="Номер паспорта"
          type="text"
          name="passportNumber"
          value={profile.passportNumber}
          readOnly
        />
      )}

      {profile.passportIssuedDate && (
        <Input
          label="Когда выдан"
          type="date"
          name="passportIssuedDate"
          value={profile.passportIssuedDate}
          readOnly
        />
      )}

      {profile.passportIssuedBy && (
        <Input
          label="Кем выдан"
          type="text"
          name="passportIssuedBy"
          value={profile.passportIssuedBy}
          readOnly
        />
      )}

      {profile.documentPhoto && (
        <div className="flex flex-col gap-3">
          {typeof profile.documentPhoto === "string" ? (
            <img src={profile.documentPhoto} alt="Uploaded Document" />
          ) : (
            <p>{profile.documentPhoto.name}</p>
          )}
        </div>
      )}

      {/* Bank Details */}
      <h3 className="font-semibold text-xl mt-5">Реквизиты пользователя</h3>

      {payments.cardNumber && (
        <Input
          label="Номер банковской карты"
          type="text"
          name="cardNumber"
          value={payments.cardNumber}
          readOnly
        />
      )}

      {payments.accountNumber && (
        <Input
          label="Расчетный счет"
          type="text"
          name="accountNumber"
          value={payments.accountNumber}
          readOnly
        />
      )}

      {payments.corrAccount && (
        <Input
          label="Корреспондентский счет"
          type="text"
          name="corrAccount"
          value={payments.corrAccount}
          readOnly
        />
      )}

      {payments.bic && (
        <Input
          label="БИК банка"
          type="text"
          name="bic"
          value={payments.bic}
          readOnly
        />
      )}

      <Link
        to="/profile/confirm"
        className="rounded-xl p-2 border-2 border-[#e5e7eb] text-gray-500 transition hover:scale-105 hover:text-gray-500"
      >
        Редактировать учетную запись
      </Link>
      <Link
        to="/profile/bank"
        className="rounded-xl p-2 border-2 border-[#e5e7eb] text-gray-500 transition hover:scale-105 hover:text-gray-500"
      >
        Реквизиты
      </Link>
      <Link
        to="/profile/changepass"
        className="rounded-xl p-2 border-2 border-[#e5e7eb] text-gray-500 transition hover:scale-105 hover:text-gray-500"
      >
        Изменить пароль
      </Link>

      {message && <span>{message}</span>}

      <Link
        to="/"
        className="bg-gray-300 text-gray-600 rounded-xl text-white p-2 transition hover:scale-105 hover:text-gray-600"
      >
        Назад
      </Link>

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
