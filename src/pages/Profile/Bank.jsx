import axios from "axios";
import Input from "../../components/Input";
import Cookies from "universal-cookie";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AlertModal from "../../components/AlertModal"; // Import the new AlertModal component

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
// Функция для валидации полей
const validatePayments = (payments) => {
  const errors = {};

  // Валидация номера карты (должен содержать 16 цифр)
  if (payments.cardNumber && !/^\d{16}$/.test(payments.cardNumber)) {
    errors.cardNumber = "Номер карты должен содержать 16 цифр.";
  }

  // Валидация расчетного счета (обычно 20 цифр)
  if (payments.accountNumber && !/^\d{20}$/.test(payments.accountNumber)) {
    errors.accountNumber = "Расчетный счет должен содержать 20 цифр.";
  }

  // Валидация корреспондентского счета (обычно 20 цифр)
  if (payments.corrAccount && !/^\d{20}$/.test(payments.corrAccount)) {
    errors.corrAccount = "Корреспондентский счет должен содержать 20 цифр.";
  }

  // Валидация БИК (обычно 9 цифр)
  if (payments.bic && !/^\d{9}$/.test(payments.bic)) {
    errors.bic = "БИК должен содержать 9 цифр.";
  }

  // Проверка, чтобы все цифры в расчетном счете не были одинаковыми
  if (payments.accountNumber && /^(\d)\1{19}$/.test(payments.accountNumber)) {
    errors.accountNumber =
      "Расчетный счет не может состоять из одинаковых цифр.";
  }

  // Проверка, чтобы все цифры в корреспондентском счете не были одинаковыми
  if (payments.corrAccount && /^(\d)\1{19}$/.test(payments.corrAccount)) {
    errors.corrAccount =
      "Корреспондентский счет не может состоять из одинаковых цифр.";
  }

  // Проверка, чтобы расчетный и корреспондентский счета не были равны
  if (
    payments.accountNumber &&
    payments.corrAccount &&
    payments.accountNumber === payments.corrAccount
  ) {
    errors.corrAccount =
      "Расчетный и корреспондентский счета не могут быть одинаковыми.";
  }

  return errors;
};

const Bank = () => {
  const cookies = new Cookies();
  const token = cookies.get("token");
  const phone = cookies.get("phone");
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [enableButton, setEnableButton] = useState(false);
  const [payments, setPayments] = useState({
    cardNumber: null,
    accountNumber: null,
    corrAccount: null,
    bic: null,
  });
  const [showModalBack, setShowModalBack] = useState(false);
  const [showModalSave, setShowModalSave] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [initialPayments, setInitialPayments] = useState({});

  // При загрузке проверяем, есть ли черновик в localStorage
  useEffect(() => {
    const savedPayments = getFromLocalStorage("paymentsData");
    if (savedPayments) {
      setPayments(savedPayments);
      setInitialPayments(savedPayments);
    } else {
      // Fetch bank details on component mount
      axios({
        method: "get",
        url: "http://localhost:3030/profile/bank-details",
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

  useEffect(() => {
    // Проверка, чтобы включить кнопку "Сохранить"
    const shouldEnableButton =
      (payments.cardNumber ||
        (payments.corrAccount && payments.bic && payments.accountNumber) ||
        (payments.cardNumber &&
          payments.corrAccount &&
          payments.bic &&
          payments.accountNumber)) &&
      JSON.stringify(payments) !== JSON.stringify(initialPayments); // Сравнение с начальными данными

    setEnableButton(shouldEnableButton);
  }, [payments, initialPayments]);

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
    if (enableButton) {
      setShowModalSave(true);
    }
  };

  const handleConfirmSubmit = async () => {
    try {
      // Submit bank details data
      const response = await axios.post(
        "http://localhost:3030/profile/bank-details",
        payments,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);
      localStorage.removeItem("paymentsData");
      console.log("Response:", response.data);
      navigate("/profile/?info=2");
    } catch (error) {
      console.log(error);
      // Optionally, set an error message here
    }
  };

  console.log(payments);

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 px-10 py-5 border-2 rounded-2xl max-w-[500px] mx-auto w-full"
      >
        <h3 className="font-semibold text-xl">Банковские реквизиты</h3>
        {payments.updatedAt && (
          <p>
            Сохранено{" "}
            {new Date(payments.updatedAt).toLocaleDateString("ru-RU", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
            г в{" "}
            {new Date(payments.updatedAt).toLocaleTimeString("ru-RU", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}

        <Input
          label="Номер банковской карты"
          type="text"
          name="cardNumber"
          value={payments.cardNumber || ""}
          onChange={HandleInput}
          maxLength={16}
        />
        {validationErrors.cardNumber && (
          <span className="text-red-600">{validationErrors.cardNumber}</span>
        )}

        <Input
          label="Рассчетный счёт"
          type="text"
          name="accountNumber"
          value={payments.accountNumber || ""}
          onChange={HandleInput}
          maxLength={20}
        />
        {validationErrors.accountNumber && (
          <span className="text-red-600">{validationErrors.accountNumber}</span>
        )}

        <Input
          label="Корреспондентский счёт"
          type="text"
          name="corrAccount"
          value={payments.corrAccount || ""}
          onChange={HandleInput}
          maxLength={20}
        />
        {validationErrors.corrAccount && (
          <span className="text-red-600">{validationErrors.corrAccount}</span>
        )}

        <Input
          label="БИК банка"
          type="text"
          name="bic"
          value={payments.bic || ""}
          onChange={HandleInput}
          maxLength={9}
        />
        {validationErrors.bic && (
          <span className="text-red-600">{validationErrors.bic}</span>
        )}

        {/* <AcceptAll name="accept" /> */}
        {message !== "" && <span>{message}</span>}
        <button
          type="submit"
          disabled={!enableButton}
          className={`${
            enableButton ? `bg-blue-600` : `bg-gray-500`
          } rounded-xl text-white transition hover:scale-105`}
        >
          Сохранить
        </button>
        <button
          type="button"
          onClick={() => {
            enableButton
              ? setShowModalBack(!showModalBack)
              : navigate("/profile");
          }}
          className="bg-gray-300 text-gray-600 rounded-xl text-white p-2 transition hover:scale-105 hover:text-gray-600"
        >
          Вернуться в меню учетной записи
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

export default Bank;
