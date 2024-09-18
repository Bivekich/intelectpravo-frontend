import React, { useState } from "react";
import axios from "axios";
import Input from "../../components/Input";
import { useNavigate } from "react-router-dom";
import { Cookies } from "react-cookie";

const Auth = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    email: "",
  });
  const cookies = new Cookies();

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
      url: "https://api.intelectpravo.ru/auth/login",
      data: {
        email: profile.email,
      },
    })
      .then(function (response) {
        // Successful response, status will be 2xx
        console.log(response.status);
        if (response.status === 200) {
          navigate("/singup");
        }
      })
      .catch(function (error) {
        if (error.response && error.response.status === 404) {
          // Handle 404 error

          cookies.set("email", profile.email, { path: "/" });
          navigate("/singin");
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
        <h3 className="font-semibold text-xl">Введите Email</h3>
        <Input
          label="Почта"
          type="email"
          name="email"
          value={profile.email}
          onChange={HandleInput}
          required
        />

        <button
          type="submit"
          className="bg-blue-600 rounded-xl text-white transition hover:scale-105"
        >
          Дальше
        </button>
      </form>
    </>
  );
};

export default Auth;
