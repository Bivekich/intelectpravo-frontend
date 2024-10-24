import axios from "axios";
import Input from "../../components/Input";
import Select from "../../components/Select";
import Cookies from "universal-cookie";
import React, { useState, useEffect } from "react";
import FormData from "form-data";
import Loader from "../../components/Loader";

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

    // Character limits
    let limitedValue = value;
    if (name === "title" && value.length > 50) {
      limitedValue = value.slice(0, 50);
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
    const updatedFile = {
      ...file,
      [name]: checked,
    };
    setFile(updatedFile);
    saveToLocalStorage(updatedFile);
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
    // Check required fields
    if (!file.title) formErrors.title = "Название произведения обязательно";
    if (!file.description) formErrors.description = "Описание обязательно";
    if (!file.price || isNaN(file.price))
      formErrors.price = "Цена должна быть числом";
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
        formData.append("price", file.price);
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
          setLoading(false); // Ensure loading is stopped in case of success or error

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
      setLoading(false); // Ensure loading is stopped in case of success or error
    }
  };

  const handleSubmitForConfirmation = async (e) => {
    e.preventDefault();
    console.log(1);
    setLoading(true);
    try {
      if (!validateForm()) return; // Stop submission if validation fails
      const response = await axios.post(
        "https://api.intelectpravo.ru/profile/verify-action",
        { phoneNumber: phone }, // Send phone number
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
    <div className="flex flex-col mx-auto gap-5 px-10 py-5 border-2 rounded-2xl max-w-[400px] w-full">
      <Loader />
    </div>
  ) : (
    <form
      onSubmit={getCode ? handleSubmit : handleSubmitForConfirmation}
      className="flex flex-col mx-auto gap-5 px-10 py-5 border-2 rounded-2xl max-w-[400px] w-full"
    >
      <h3 className="font-semibold text-xl">Реквизиты пользователя</h3>

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
        label="Описание"
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

      <Input
        label="Цена"
        type="text"
        name="price"
        value={file.price || ""}
        onChange={HandleInput}
        required
        readOnly={getCode}
      />
      {errors.price && <span className="text-red-500">{errors.price}</span>}

      <Select
        label="Тип продажи"
        name="saleType"
        value={file.saleType || ""}
        onChange={HandleSelect}
        options={[
          { label: "Права", value: "rights" },
          { label: "Лицензия", value: "license" },
        ]}
        required
        readOnly={getCode}
      />
      {errors.saleType && (
        <span className="text-red-500">{errors.saleType}</span>
      )}

      {getCode ? (
        <>
          <p>Ваш файл:</p>
          {file.file && (
            <a
              href={`https://api.intelectpravo.ru/path/to/download/${file.file.name}`} // Replace with your file's download URL
              className="text-blue-500 underline"
              download // This attribute prompts the browser to download the file
            >
              {file.file.name}
            </a>
          )}
        </>
      ) : (
        <Input
          label="Файл"
          type="file"
          name="file"
          onChange={handleFileChange}
          required
          readOnly={getCode}
        />
      )}

      {errors.file && <span className="text-red-500">{errors.file}</span>}

      <div className={`flex flex-row gap-2 ${!license ? "hidden" : ""}`}>
        <input
          type="checkbox"
          name="isExclusive"
          id="isExclusive"
          onChange={HandleCheckbox}
          checked={file.isExclusive || false}
        />
        <label htmlFor="isExclusive">Эксклюзивный</label>
      </div>

      <Input
        label="Срок лицензии (лет)"
        type="text"
        name="licenseTerm"
        hidden={!license}
        value={file.licenseTerm || ""}
        onChange={HandleInput}
      />
      {errors.licenseTerm && (
        <span className="text-red-500">{errors.licenseTerm}</span>
      )}

      {getCode && (
        <>
          <p>Введите код подтверждения который пршел Вам на телефон</p>
          <Input
            label="Код подтверждени"
            type="text"
            name="code"
            value={code || ""}
            onChange={(e) => setCode(e.target.value)}
          />
        </>
      )}

      {message && <span>{message}</span>}
      <button
        type="submit"
        className="bg-blue-600 rounded-xl text-white transition hover:scale-105"
      >
        Продать
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

export default Sell;
