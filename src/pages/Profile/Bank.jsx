import axios from "axios";
import Input from "../../components/Input";
import Cookies from "universal-cookie";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AcceptAll from "../../components/AcceptAll";

const EXPIRATION_TIME = 300000; // 5 минут

// Функция для сохранения данных в localStorage с текущим временем
const saveToLocalStorage = (key, value) => {
  const expiration = Date.now() + EXPIRATION_TIME; // Время истечения через 5 минут
  const data = {
    value, // Сохраненные данные
    expiration, // Время истечения
  };
  localStorage.setItem(key, JSON.stringify(data));
};

// Функция для получения данных из localStorage с проверкой истечения срока
const getFromLocalStorage = (key) => {
  const storedData = localStorage.getItem(key);
  if (!storedData) return null;

  const { value, expiration } = JSON.parse(storedData);
  if (Date.now() > expiration) {
    // Если данные истекли, удаляем их и возвращаем null
    localStorage.removeItem(key);
    return null;
  }

  return value;
};

// Функция для валидации полей
const validatePayments = (payments) => {
  const errors = {};

  // Валидация номера карты (должен содержать 16 цифр)
  if (!/^\d{16}$/.test(payments.cardNumber)) {
    errors.cardNumber = "Номер карты должен содержать 16 цифр.";
  }

  // Валидация расчетного счета (обычно 20 цифр)
  if (!/^\d{20}$/.test(payments.accountNumber)) {
    errors.accountNumber = "Расчетный счет должен содержать 20 цифр.";
  }

  // Валидация корреспондентского счета (обычно 20 цифр)
  if (!/^\d{20}$/.test(payments.corrAccount)) {
    errors.corrAccount = "Корреспондентский счет должен содержать 20 цифр.";
  }

  // Валидация БИК (обычно 9 цифр)
  if (!/^\d{9}$/.test(payments.bic)) {
    errors.bic = "БИК должен содержать 9 цифр.";
  }

  return errors;
};

const Bank = () => {
  const cookies = new Cookies();
  const token = cookies.get("token");
  const phone = cookies.get("phone");
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [payments, setPayments] = useState({
    cardNumber: "",
    accountNumber: "",
    corrAccount: "",
    bic: "",
  });
  const [validationErrors, setValidationErrors] = useState({});

  // При загрузке проверяем, есть ли черновик в localStorage
  useEffect(() => {
    const savedPayments = getFromLocalStorage("paymentsData");
    if (savedPayments) {
      setPayments(savedPayments);
    } else {
      // Fetch bank details on component mount
      axios({
        method: "get",
        url: "http://localhost:3000/profile/bank-details",
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
    }
  }, [token]);

  const HandleInput = (e) => {
    const { name, value } = e.target;
    const updatedPayments = {
      ...payments,
      [name]: value,
    };
    setPayments(updatedPayments);
    saveToLocalStorage("paymentsData", updatedPayments); // Сохраняем данные в localStorage
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    // Проверяем данные перед отправкой
    const errors = validatePayments(payments);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return; // Если есть ошибки, форма не отправляется
    }

    try {
      // Submit bank details data
      const response = await axios.post(
        "http://localhost:3000/profile/verify-action",
        { phoneNumber: phone },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Response:", response.data);
      localStorage.setItem("paymentsData", JSON.stringify(payments));
      navigate("/profile/confirmaction/updatebank");
      // const response_ = await axios.post(
      //   "http://localhost:3000/profile/confirm",
      //   payments,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   }
      // );

      // if (response_.data) {
      //   // Remove token from cookies
      //   cookies.remove("token", { path: "/" });

      //   // Redirect to the homepage
      //   navigate("/");

      //   // Set success message
      //   setMessage(response_.data.message);

      //   // Remove draft after successful submission
      //   localStorage.removeItem("paymentsData");
      // }
    } catch (error) {
      console.log(error);
      // Optionally, set an error message here
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 px-10 py-5 border-2 rounded-2xl max-w-[500px] mx-auto w-full"
    >
      <h3 className="font-semibold text-xl">Реквизиты пользователя</h3>

      <Input
        label="НОМЕР БАНКОВСКОЙ КАРТЫ"
        type="text"
        name="cardNumber"
        value={payments.cardNumber || ""}
        onChange={HandleInput}
        required
      />
      {validationErrors.cardNumber && (
        <span className="text-red-600">{validationErrors.cardNumber}</span>
      )}

      <Input
        label="РАСЧЕТНЫЙ СЧЁТ"
        type="text"
        name="accountNumber"
        value={payments.accountNumber || ""}
        onChange={HandleInput}
        required
      />
      {validationErrors.accountNumber && (
        <span className="text-red-600">{validationErrors.accountNumber}</span>
      )}

      <Input
        label="КОРРЕСПОНДЕТСКИЙ СЧЁТ"
        type="text"
        name="corrAccount"
        value={payments.corrAccount || ""}
        onChange={HandleInput}
        required
      />
      {validationErrors.corrAccount && (
        <span className="text-red-600">{validationErrors.corrAccount}</span>
      )}

      <Input
        label="БИК БАНКА"
        type="text"
        name="bic"
        value={payments.bic || ""}
        onChange={HandleInput}
        required
      />
      {validationErrors.bic && (
        <span className="text-red-600">{validationErrors.bic}</span>
      )}

      <AcceptAll name="accept" />
      {message !== "" && <span>{message}</span>}
      <button
        type="submit"
        className="bg-blue-600 rounded-xl text-white transition hover:scale-105"
      >
        Сохранить изменения
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

export default Bank;
