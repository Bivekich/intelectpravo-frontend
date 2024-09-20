import axios from "axios";
import Input from "../../components/Input";
import Cookies from "universal-cookie";
import React, { useState, useEffect } from "react";

const Bank = () => {
  const cookies = new Cookies();
  const token = cookies.get("token");
  const [message, setMessage] = useState("");
  const [payments, setPayments] = useState({
    cardNumber: "",
    accountNumber: "",
    corrAccount: "",
    bic: "",
  });

  useEffect(() => {
    // Fetch bank details on component mount
    axios({
      method: "get",
      url: "https://api.intelectpravo.ru/profile/bank-details",
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
  }, [token]);

  const HandleInput = (e) => {
    const { name, value } = e.target;
    setPayments((prevPayments) => ({
      ...prevPayments,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    try {
      // Submit bank details data
      const response = await axios.post(
        "https://api.intelectpravo.ru/profile/bank-details",
        payments,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);
      const response_ = await axios.post(
        "https://api.intelectpravo.ru/profile/confirm",
        payments,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response_);
      if (response_.data) {
        setMessage(response_.data.message);
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
      {message != "" && <span>{message}</span>}
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
