import Cookies from "universal-cookie";
import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";

const Header = () => {
  const cookies = new Cookies();
  const navigate = useNavigate();
  const location = useLocation();
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState("Не подтвержден");
  const [headerVisible, setHeaderVisible] = useState(true); // состояние для видимости заголовка

  const checkToken = () => {
    const token = cookies.get("token");
    if (!token) {
      if (
        location.pathname !== "/auth" &&
        location.pathname !== "/signin" &&
        location.pathname !== "/loginbypass" &&
        location.pathname !== "/signup"
      ) {
        navigate("/auth", { replace: true });
      }
      setHeaderVisible(false); // Скрыть заголовок, если токен отсутствует
    } else {
      // Если токен есть, загружаем данные профиля
      axios({
        method: "get",
        url: "https://api.intelectpravo.ru/profile/basic",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (response.data) {
            setConfirmed(response.data.isConfirmed);
            if (response.data.admin) {
              setStatus("Администратор");
            } else if (response.data.isConfirmed) {
              setStatus("Подтвержден");
            }
          }
        })
        .catch((error) => {
          console.error(error);
          cookies.delete("token");
          cookies.delete("email");
          navigate("/auth", { replace: true });
        });
      setHeaderVisible(true); // Показываем заголовок, если токен есть
    }
  };

  useEffect(() => {
    checkToken(); // Проверяем токен при монтировании компонента

    // Установка слушателя для изменения куков
    const handleCookieChange = () => {
      checkToken();
    };

    window.addEventListener("storage", handleCookieChange); // Используем storage event для отслеживания изменений в куках (это может не сработать для локальных изменений)

    return () => {
      window.removeEventListener("storage", handleCookieChange);
    };
  }, [location.pathname, navigate]);

  if (!headerVisible) {
    return null; // Пока идет загрузка, ничего не рендерим
  }

  return (
    <>
      <div className="flex flex-col gap-3 mb-3">
        <div className="flex justify-between gap-3 items-center px-5 py-3 shadow-md rounded-xl border-2 text-gray-500 dark:text-gray-200 dark:hover:text-gray-200 transition-all hover:text-gray-600 hover:scale-105">
          <img src="/logo.svg" alt="ЛОГО" width="30" />
          <span>{status}</span>
        </div>
        <div className="flex flex-row flex-wrap w-full gap-3 w-fit mx-auto justify-center">
          {confirmed && (
            <>
              <a
                className="px-5 py-3 shadow-md rounded-xl border-2 text-gray-500 dark:text-gray-200 dark:hover:text-gray-200 transition-all hover:text-gray-600 hover:scale-105"
                href="/sell"
              >
                Продать
              </a>
              <a
                className="px-5 py-3 shadow-md rounded-xl border-2 text-gray-500 dark:text-gray-200 dark:hover:text-gray-200 transition-all hover:text-gray-600 hover:scale-105"
                href="/buy"
              >
                Купить
              </a>
            </>
          )}
          <a
            className="px-5 py-3 shadow-md rounded-xl border-2 text-gray-500 dark:text-gray-200 dark:hover:text-gray-200 transition-all hover:text-gray-600 hover:scale-105"
            href="/profile"
          >
            Профиль
          </a>
          {confirmed && (
            <a
              className="px-5 py-3 shadow-md rounded-xl border-2 text-gray-500 dark:text-gray-200 dark:hover:text-gray-200 transition-all hover:text-gray-600 hover:scale-105"
              href="/files"
            >
              Файлы
            </a>
          )}
        </div>
        {/* {confirmed && (
          <div className="px-5 py-3 shadow-md rounded-xl border-2 text-gray-500 dark:text-gray-200 dark:hover:text-gray-200 transition-all hover:text-gray-600 hover:scale-105">
            Профиль подтвержден
          </div>
        )} */}
      </div>
    </>
  );
};

export default Header;
