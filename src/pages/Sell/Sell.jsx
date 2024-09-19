import axios from "axios";
import Input from "../../components/Input";
import Select from "../../components/Select"; // Убедитесь, что Select компонент импортирован
import Cookies from "universal-cookie";
import React, { useState, useEffect } from "react";

const Sell = () => {
  const cookies = new Cookies();
  const token = cookies.get("token");
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

  const HandleInput = (e) => {
    const { name, value } = e.target;
    setFile((prevFile) => ({
      ...prevFile,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    try {
      // Submit form data
      const response = await axios.post(
        "https://api.intelectpravo.ru/profile/bank-details",
        file,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile((prevState) => ({
      ...prevState,
      file: selectedFile, // Set the selected file to the state
    }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 px-10 py-5 border-2 rounded-2xl max-w-[400px] w-full"
    >
      <h3 className="font-semibold text-xl">Реквизиты пользователя</h3>

      <Input
        label="Название произведения"
        type="text"
        name="title"
        value={file.title || ""}
        onChange={HandleInput}
      />
      <Input
        label="Описание"
        type="text"
        name="description"
        value={file.description || ""}
        onChange={HandleInput}
      />
      <Input
        label="Цена"
        type="text"
        name="price"
        value={file.price || ""}
        onChange={HandleInput}
      />
      <Input
        label="Цена"
        type="text"
        name="licenseTerm"
        value={file.licenseTerm || ""}
        onChange={HandleInput}
      />

      <Select
        label="Тип продажи"
        name="saleType"
        value={file.saleType || ""}
        onChange={HandleInput}
        options={[
          { label: "Права", value: "rules" },
          { label: "Лицензия", value: "license" },
        ]}
      />

      <Input label="Файл" type="file" name="file" onChange={handleFileChange} />
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

export default Sell;
