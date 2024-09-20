import Input from "../../components/Input";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import axios from "axios";

const SignIn = () => {
  const navigate = useNavigate();
  const cookies = new Cookies();
  const [profile, setProfile] = useState({
    fio: "",
    email: cookies.get("email"),
  });

  const HandleInput = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Отключаем перезагрузку страницы

    axios({
      method: "post",
      url: "https://api.intelectpravo.ru/auth/register",
      data: {
        email: profile.email,
        fullName: profile.fio,
      },
    })
      .then(function (response) {
        // Successful response, status will be 2xx
        console.log(response);
        if (response.status === 200) {
          navigate("/auth");
        }
      })
      .catch(function (error) {
        if (
          error.response &&
          error.response.data.message ===
            "Пользователь уже существует. Авторизуйтесь."
        ) {
          navigate("/auth");
        } else {
          // Handle other errors or network issues
          console.error("An error occurred:", error);
        }
      });
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 px-10 py-5 border-2 rounded-2xl max-w-[400px] w-full"
      >
        <h3 className="font-semibold text-xl">Регистрация</h3>
        <Input
          label="ФИО"
          type="text"
          name="fio"
          value={profile.fio}
          onChange={HandleInput}
          required
        />
        <div className="flex flex-row gap-2">
          <input type="checkbox" name="accept" id="accept" required />
          <label htmlFor="">Согласен</label>
        </div>
        <button
          type="submit"
          className="bg-blue-600 rounded-xl text-white transition hover:scale-105"
        >
          Зарегистрироватся
        </button>
      </form>
    </>
  );
};

export default SignIn;
