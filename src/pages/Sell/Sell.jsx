import axios from "axios";
import Input from "../../components/Input";
import Select from "../../components/Select";
import Cookies from "universal-cookie";
import React, { useState, useEffect } from "react";
import FormData from "form-data";
import Loader from "../../components/Loader";

const Sell = () => {
  const cookies = new Cookies();
  const token = cookies.get("token");
  const [license, setLicense] = useState(false);
  const [message, setMessage] = useState(false);
  const [loading, setLoading] = useState(false);
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

  // Load data from localStorage when the component mounts
  useEffect(() => {
    const savedData = localStorage.getItem("formData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setFile(parsedData);
      setLicense(parsedData.saleType === "license");
    }
  }, []);

  // Function to save form data to localStorage
  const saveToLocalStorage = (updatedData) => {
    localStorage.setItem("formData", JSON.stringify(updatedData));
  };

  const HandleInput = (e) => {
    const { name, value } = e.target;
    const updatedFile = {
      ...file,
      [name]: value,
    };
    setFile(updatedFile);
    saveToLocalStorage(updatedFile); // Save to localStorage after updating state
  };

  const HandleCheckbox = (e) => {
    const { name, checked } = e.target;
    const updatedFile = {
      ...file,
      [name]: checked,
    };
    setFile(updatedFile);
    saveToLocalStorage(updatedFile); // Save to localStorage after updating state
  };

  const HandleSelect = (e) => {
    const { name, value } = e.target;
    const updatedFile = {
      ...file,
      [name]: value,
    };
    setFile(updatedFile);
    setLicense(value === "license");
    saveToLocalStorage(updatedFile); // Save to localStorage after updating state
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const updatedFile = {
      ...file,
      file: selectedFile,
    };
    setFile(updatedFile);
    saveToLocalStorage(updatedFile); // Save to localStorage after updating state
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

    axios
      .post("https://api.intelectpravo.ru/sale/create", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log(response.data);
        setMessage("Произведение опублиовано на продажу");
        setLoading(false);
        localStorage.removeItem("formData"); // Clear the data from localStorage after successful submission
      })
      .catch((error) => {
        console.error(
          "Error:",
          error.response ? error.response.data : error.message
        );
      });
  };

  return loading ? (
    <div className="flex flex-col mx-auto gap-5 px-10 py-5 border-2 rounded-2xl max-w-[400px] w-full">
      <Loader />
    </div>
  ) : (
    <form
      onSubmit={handleSubmit}
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
      />
      <Input
        label="Описание"
        type="text"
        name="description"
        value={file.description || ""}
        onChange={HandleInput}
        required
      />
      <Input
        label="Цена"
        type="text"
        name="price"
        value={file.price || ""}
        onChange={HandleInput}
        required
      />

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
      />

      <Input
        label="Файл"
        type="file"
        name="file"
        onChange={handleFileChange}
        required
      />

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
        label="Срок лицензии лет"
        type="text"
        name="licenseTerm"
        hidden={!license}
        value={file.licenseTerm || ""}
        onChange={HandleInput}
      />
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
