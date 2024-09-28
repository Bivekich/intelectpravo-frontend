import axios from "axios";
import Input from "../../components/Input";
import Cookies from "universal-cookie";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AcceptAll from "../../components/AcceptAll";
// Время жизни данных в миллисекундах (5 минут = 300000 мс)
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

const Bank = () => {
  const cookies = new Cookies();
  const token = cookies.get("token");
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [payments, setPayments] = useState({
    cardNumber: "",
    accountNumber: "",
    corrAccount: "",
    bic: "",
  });

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
          console.log(response);
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

    try {
      // Submit bank details data
      const response = await axios.post(
        "http://localhost:3000/profile/bank-details",
        payments,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);

      const response_ = await axios.post(
        "http://localhost:3000/profile/confirm",
        payments,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response_);

      if (response_.data) {
        // Remove token from cookies
        cookies.remove("token", { path: "/" });

        // Redirect to the homepage
        navigate("/"); // This will redirect the user to the homepage

        // Optionally, you can set a success message
        setMessage(response_.data.message);

        // Remove draft after successful submission
        localStorage.removeItem("paymentsData");
      }
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
      <Input
        label="РАСЧЕТНЫЙ СЧЁТ"
        type="text"
        name="accountNumber"
        value={payments.accountNumber || ""}
        onChange={HandleInput}
        required
      />
      <Input
        label="КОРРЕСПОНДЕТСКИЙ СЧЁТ"
        type="text"
        name="corrAccount"
        value={payments.corrAccount || ""}
        onChange={HandleInput}
        required
      />
      <Input
        label="БИК БАНКА"
        type="text"
        name="bic"
        value={payments.bic || ""}
        onChange={HandleInput}
        required
      />
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
