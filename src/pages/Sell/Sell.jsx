import axios from "axios";
import Input from "../../components/Input";
import Select from "../../components/Select";
import Cookies from "universal-cookie";
import React, { useState, useEffect } from "react";
import FormData from "form-data";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";

const Sell = () => {
  const cookies = new Cookies();
  const phone = cookies.get("phone");
  const token = cookies.get("token");
  const [code, setCode] = useState("");
  const [getCode, setGetCode] = useState(false);
  const [license, setLicense] = useState(false);
  const [message, setMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isFreeDeal, setIsFreeDeal] = useState(false);
  const [file, setFile] = useState({
    title: "",
    description: "",
    price: "",
    accountNumber: "",
    saleType: "",
    isExclusive: "",
    licenseTerm: "",
    file: null,
  });

  useEffect(() => {
    const savedData = localStorage.getItem("formData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setFile(parsedData);
      setLicense(parsedData.saleType === "license");
    }
  }, []);

  const saveToLocalStorage = (updatedData) => {
    localStorage.setItem("formData", JSON.stringify(updatedData));
  };

  const HandleInput = (e) => {
    const { name, value } = e.target;

    // Restrict input for price
    let limitedValue = value;
    if (name === "price") {
      limitedValue = limitedValue.replace(/[^\d,]/g, ""); // Allow only digits and commas
      const parts = limitedValue.split(",");
      if (parts[0].length > 8) parts[0] = parts[0].slice(0, 8); // Limit integer part to 8 digits
      if (parts[1]) parts[1] = parts[1].slice(0, 2); // Limit decimal part to 2 digits
      limitedValue = parts.join(",");
    }

    if (name === "title" && value.length > 100) {
      limitedValue = value.slice(0, 100);
    }
    if (name === "description" && value.length > 250) {
      limitedValue = value.slice(0, 250);
    }

    const updatedFile = {
      ...file,
      [name]: limitedValue,
    };
    setFile(updatedFile);
    saveToLocalStorage(updatedFile);

    // Perform validation after updating state
    validateForm();
  };

  const HandleCheckbox = (e) => {
    const { name, checked } = e.target;
    if (name === "isFreeDeal") {
      setIsFreeDeal(checked);
      setFile({ ...file, price: checked ? "" : file.price });
    } else {
      const updatedFile = { ...file, [name]: checked };
      setFile(updatedFile);
      saveToLocalStorage(updatedFile);
    }
  };

  const HandleSelect = (e) => {
    const { name, value } = e.target;
    const updatedFile = {
      ...file,
      [name]: value,
    };
    setFile(updatedFile);
    setLicense(value === "license");
    saveToLocalStorage(updatedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const updatedFile = {
      ...file,
      file: selectedFile,
    };
    setFile(updatedFile);
    saveToLocalStorage(updatedFile);
  };

  const validateForm = () => {
    let formErrors = {};
    if (!file.title) formErrors.title = "Название произведения обязательно";
    if (!file.description) formErrors.description = "Описание обязательно";
    if (!isFreeDeal && (!file.price || isNaN(file.price.replace(",", ".")))) {
      formErrors.price = "Цена должна быть числом";
    }
    if (!file.saleType) formErrors.saleType = "Тип продажи обязателен";
    if (license && (!file.licenseTerm || isNaN(file.licenseTerm))) {
      formErrors.licenseTerm = "Срок лицензии должен быть числом";
    }
    if (!file.file) formErrors.file = "Файл обязателен для загрузки";

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://api.intelectpravo.ru/profile/check-verify",
        {
          phoneNumber: phone,
          code: code,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setLoading(true);
        const formData = new FormData();
        formData.append("file", file.file);
        formData.append("title", file.title);
        formData.append("description", file.description);
        formData.append("price", isFreeDeal ? "0,00" : file.price);
        formData.append("accountNumber", file.accountNumber);
        formData.append("saleType", file.saleType);
        formData.append("isExclusive", file.isExclusive);
        formData.append("licenseTerm", file.licenseTerm);

        const response1 = await axios.post(
          "https://api.intelectpravo.ru/sale/create",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response1.status === 200) {
          setLoading(false);
          alert("Произведение опубликовано на продажу");
          setMessage("Произведение опубликовано на продажу");
          localStorage.removeItem("formData");
        }
      }
    } catch (error) {
      if (error.response.status === 400) {
        alert("Неправильный или просроченный код.");
        setMessage("Неправильный или просроченный код.");
      }
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForConfirmation = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!validateForm()) return;
      const response = await axios.post(
        "https://api.intelectpravo.ru/profile/verify-action",
        { phoneNumber: phone },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Response:", response.data);
      setGetCode(true);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  return loading ? (
    <div className="flex flex-col mx-auto gap-5 px-10 py-5 border-2 rounded-2xl max-w-[600px] w-full">
      <Loader />
    </div>
  ) : (
    <form
      onSubmit={getCode ? handleSubmit : handleSubmitForConfirmation}
      className="flex flex-col mx-auto gap-5 px-10 py-5 border-2 rounded-2xl max-w-[400px] w-full"
    >
      <h3 className="font-semibold text-xl">
        Формирование предложения по передаче прав на произведение
      </h3>

      <Input
        label="Название произведения"
        type="text"
        name="title"
        value={file.title || ""}
        onChange={HandleInput}
        required
        readOnly={getCode}
      />
      {errors.title && <span className="text-red-500">{errors.title}</span>}

      <Input
        label="Описание произведения"
        type="text"
        name="description"
        value={file.description || ""}
        onChange={HandleInput}
        required
        readOnly={getCode}
      />
      {errors.description && (
        <span className="text-red-500">{errors.description}</span>
      )}

      <div className="flex items-center flex-col gap-3">
        <Input
          label="Цена произведения"
          type="text"
          name="price"
          value={isFreeDeal ? "0,00" : file.price || ""}
          onChange={HandleInput}
          required={!isFreeDeal}
          readOnly={getCode || isFreeDeal}
          style={{ backgroundColor: isFreeDeal ? "#f0f0f0" : "white" }}
        />
        <label className="ml-2 flex items-center">
          <input
            type="checkbox"
            name="isFreeDeal"
            checked={isFreeDeal}
            onChange={HandleCheckbox}
            disabled={getCode}
          />
          <span className="ml-2">Безвозмездная сделка</span>
        </label>
      </div>
      {errors.price && <span className="text-red-500">{errors.price}</span>}

      <Select
        label="Тип продажи"
        name="saleType"
        value={file.saleType || ""}
        onChange={HandleSelect}
        required
        options={[
          { value: "rights", label: "Отчуждение исключительных прав" },
          { value: "license", label: "Передача лицензионных прав" },
        ]}
      />
      {errors.saleType && (
        <span className="text-red-500">{errors.saleType}</span>
      )}

      {license && (
        <>
          <Input
            label="Срок действия лицензии"
            type="number"
            name="licenseTerm"
            value={file.isPermanent ? 99 : file.licenseTerm || ""}
            onChange={HandleInput}
            required={!file.isPermanent}
            readOnly={getCode || file.isPermanent}
            style={{ backgroundColor: file.isPermanent ? "#f0f0f0" : "white" }}
          />
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isExclusive"
              checked={file.isExclusive}
              onChange={HandleCheckbox}
              disabled={getCode}
            />
            <span className="ml-2">Исключительная лицензия</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isPermanent"
              checked={file.isPermanent}
              onChange={HandleCheckbox}
              disabled={getCode}
            />
            <span className="ml-2">Бессрочная лицензия</span>
          </label>
          {errors.licenseTerm && (
            <span className="text-red-500">{errors.licenseTerm}</span>
          )}
        </>
      )}

      <Input
        label="Электронный документ с произведением"
        type="file"
        name="file"
        onChange={handleFileChange}
        required
        disabled={getCode}
      />
      {errors.file && <span className="text-red-500">{errors.file}</span>}

      {getCode && (
        <Input
          label="Код подтверждения"
          type="text"
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          disabled={getCode}
        />
      )}

      <button
        type="submit"
        className={`py-2 px-4 rounded-xl ${
          !loading ? "bg-blue-600" : "bg-gray-400"
        } text-white`}
        disabled={loading}
      >
        {getCode ? "Подтвердить код" : "Сформировать предложение"}
      </button>
      <Link
        to="/"
        className="bg-gray-400 text-gray-500 rounded-xl text-white p-2 transition hover:scale-105 hover:text-gray-600"
      >
        Вернуться в личный кабинет
      </Link>
      {message && <p className="text-green-500">{message}</p>}
    </form>
  );
};

export default Sell;