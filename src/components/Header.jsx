import Cookies from "universal-cookie";
import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AlertModal from "./AlertModal";

const Header = () => {
  const cookies = new Cookies();
  const navigate = useNavigate();
  const location = useLocation();
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState("");
  const [admin, setAdmin] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true); // состояние для видимости заголовка
  const [showModal, setShowModal] = useState(false); // Modal visibility state

  const checkToken = () => {
    const token = cookies.get("token");
    const currentPath = cookies.get("path");
    if (!token) {
      if (
        location.pathname !== "/auth" &&
        location.pathname !== "/signin" &&
        location.pathname !== "/loginbypass" &&
        location.pathname !== "/signup"
      ) {
        navigate("/auth", { replace: true });
      }
      if (currentPath && location.pathname != currentPath) {
        navigate(currentPath, { replace: true });
      }

      setHeaderVisible(false); // Скрыть заголовок, если токен отсутствует
    } else {
      if (
        location.pathname === "/auth" ||
        location.pathname === "/signin" ||
        location.pathname === "/loginbypass" ||
        location.pathname === "/signup"
      ) {
        navigate("/", { replace: true });
      }
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
            setAdmin(false);
            if (response.data.admin) {
              setAdmin(true);
              setStatus("Администратор");
            } else if (response.data.isConfirmed) {
              setStatus("Подтвержденная учётная запись");
            } else if (!response.data.isConfirmed) {
              setStatus("Не подтвержден");
            }
            cookies.set("phone", response.data.phoneNumber, { path: "/" });
          }
        })
        .catch((error) => {
          console.error(error);
          cookies.remove("token", { path: "/" });
          cookies.remove("email", { path: "/" });
          cookies.remove("phone", { path: "/" });
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

  const relogin = () => {
    setShowModal(true);
  };

  const handleConfirm = () => {
    // "Да" button click handler - navigate to registration
    cookies.remove("email", { path: "/" });
    cookies.remove("phone", { path: "/" });
    cookies.remove("login", { path: "/" });
    cookies.remove("token", { path: "/" });
    navigate("/");
    setShowModal(false);
  };

  const handleCancel = () => {
    // "Нет" button click handler - just close the modal
    setShowModal(false);
  };

  return (
    <>
      <header className="flex flex-col gap-3 mb-3 w-full self-start">
        <div className="flex justify-between gap-3 items-center px-5 py-3 shadow-md rounded-xl border-2 text-gray-500 dark:text-gray-200 dark:hover:text-gray-200 transition-all hover:text-gray-600">
          <span>IntelectPravo</span>
          <div className="flex flex-row gap-5 items-center">
            <span>{status}</span>
            {headerVisible && (
              <button
                type="button"
                onClick={relogin}
                className="bg-red-600 rounded-xl text-white transition hover:scale-105"
              >
                Выйти из учётной записи
              </button>
            )}
          </div>
        </div>
        {headerVisible ? (
          <div className="flex flex-row flex-wrap w-full gap-3 w-fit mx-auto justify-center">
            {(confirmed || admin) && (
              <>
                <Link
                  className="px-5 py-3 shadow-md rounded-xl border-2 text-gray-500 dark:text-gray-200 dark:hover:text-gray-200 transition-all hover:text-gray-600 hover:scale-105"
                  to="/sell"
                >
                  Продать
                </Link>
                <Link
                  className="px-5 py-3 shadow-md rounded-xl border-2 text-gray-500 dark:text-gray-200 dark:hover:text-gray-200 transition-all hover:text-gray-600 hover:scale-105"
                  to="/buy"
                >
                  Купить
                </Link>
              </>
            )}
            <Link
              className="px-5 py-3 shadow-md rounded-xl border-2 text-gray-500 dark:text-gray-200 dark:hover:text-gray-200 transition-all hover:text-gray-600 hover:scale-105"
              to="/profile"
            >
              Учётная запись
            </Link>
            {(confirmed || admin) && (
              <Link
                className="px-5 py-3 shadow-md rounded-xl border-2 text-gray-500 dark:text-gray-200 dark:hover:text-gray-200 transition-all hover:text-gray-600 hover:scale-105"
                to="/files"
              >
                Файлы
              </Link>
            )}
            {admin && (
              <Link
                className="px-5 py-3 shadow-md rounded-xl border-2 text-gray-500 dark:text-gray-200 dark:hover:text-gray-200 transition-all hover:text-gray-600 hover:scale-105"
                to="/orders"
              >
                Заявки
              </Link>
            )}
          </div>
        ) : (
          ""
        )}
        {/* {confirmed && (
          <div className="px-5 py-3 shadow-md rounded-xl border-2 text-gray-500 dark:text-gray-200 dark:hover:text-gray-200 transition-all hover:text-gray-600 hover:scale-105">
            Подтвержденная учётная запись
          </div>
        )} */}
      </header>

      {showModal && (
        <AlertModal
          title="Вы действительно хотите выйти из учётной записи?"
          message=""
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};

export default Header;
