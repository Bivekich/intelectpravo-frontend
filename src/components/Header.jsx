import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";

const Header = () => {
  const cookies = new Cookies();
  const token = cookies.get("token");
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);

  if (!token) {
  }

  useEffect(() => {
    // Fetch profile data on component mount
    axios({
      method: "get",
      url: "https://api.intelectpravo.ru/profile/basic",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        console.log(response);
        if (response.data) {
          setConfirmed(response.data.isConfirmed);
        }
      })
      .catch((error) => {
        navigate("/auth");
      });
  }, [token]);

  return (
    <>
      <div className="flex flex-row flex-wrap w-full gap-3 mb-5">
        {confirmed && (
          <>
            <a
              className="px-5 py-3 shadow-md rounded-xl border-2 text-gray-500 transition-all hover:text-gray-600 hover:scale-105"
              href="/sell"
            >
              Продать
            </a>
            <a
              className="px-5 py-3 shadow-md rounded-xl border-2 text-gray-500 transition-all hover:text-gray-600 hover:scale-105"
              href="/buy"
            >
              Купить
            </a>
          </>
        )}
        <a
          className="px-5 py-3 shadow-md rounded-xl border-2 text-gray-500 transition-all hover:text-gray-600 hover:scale-105"
          href="/profile"
        >
          Профиль
        </a>
        {confirmed && (
          <a
            className="px-5 py-3 shadow-md rounded-xl border-2 text-gray-500 transition-all hover:text-gray-600 hover:scale-105"
            href="/files"
          >
            Файлы
          </a>
        )}
      </div>
    </>
  );
};
export default Header;
