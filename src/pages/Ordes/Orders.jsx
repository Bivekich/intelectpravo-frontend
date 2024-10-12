import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "universal-cookie";

const Orders = () => {
  const cookies = new Cookies();
  const token = cookies.get("token");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch profile data on component mount
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/profile/getNotConfirmedFilledUsers",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUsers(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchUsers();
  }, [token]);

  const updateUserState = (updatedUserId, updateField) => {
    setUsers((prevUsers) => {
      return prevUsers
        .map((user) =>
          user.userId === updatedUserId ? { ...user, ...updateField } : user
        )
        .sort((a, b) => a.isConfirmed - b.isConfirmed); // Sort users
    });
  };

  const addAdmin = async (userId) => {
    updateUserState(userId, { admin: true });
    try {
      await axios.post(
        "http://localhost:3000/profile/addAdmin",
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const removeAdmin = async (userId) => {
    updateUserState(userId, { admin: false });
    try {
      await axios.post(
        "http://localhost:3000/profile/removeAdmin",
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const confirm = async (userId) => {
    // Remove confirmed user from the list
    updateUserState(userId, { isConfirmed: true }); // Update confirmation status
    try {
      const response = await axios.post(
        "http://localhost:3000/profile/confirm",
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response); // Log the response for debugging

      //   alert("Пользователь подтвержден!");
    } catch (error) {
      console.log(error);
    }
  };

  const disconfirm = async (userId) => {
    updateUserState(userId, { isConfirmed: false }); // Update confirmation status
    try {
      await axios.post(
        "http://localhost:3000/profile/disconfirm",
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col mx-auto gap-5 px-10 py-5 border-2 rounded-2xl w-full">
      <h1>Пользователи и администраторы</h1>
      <ul>
        {users.map((user) => (
          <li key={user.userId} className="border-b-2 pb-3 mb-3 text-start">
            <div className="flex flex-row gap-5 justify-between">
              <div className="flex flex-col gap-3">
                <p>
                  <strong>Имя:</strong> {user.name}
                </p>
                <p>
                  <strong>Фамилия:</strong> {user.surname}
                </p>
                <p>
                  <strong>Отчество:</strong> {user.patronymic}
                </p>
                <p>
                  <strong>Дата рождения:</strong>{" "}
                  {new Date(user.birthDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Адрес:</strong> {user.address}
                </p>
                <p>
                  <strong>Серия паспорта:</strong> {user.passportSeries}
                </p>
                <p>
                  <strong>Номер паспорта:</strong> {user.passportNumber}
                </p>
                <p>
                  <strong>Кем выдан паспорт:</strong> {user.passportIssuedBy}
                </p>
                <p>
                  <strong>Код подразделения:</strong> {user.passportCode}
                </p>
                <p>
                  <strong>Дата выдачи паспорта:</strong>{" "}
                  {new Date(user.passportIssuedDate).toLocaleDateString()}
                </p>
                {user.documentPhoto && (
                  <div>
                    <strong>Фото документа:</strong>
                    <img
                      src={user.documentPhoto}
                      alt="Фото документа"
                      className="max-w-xs mt-2 border"
                    />
                  </div>
                )}
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Телефон:</strong> {user.phoneNumber}
                </p>
                <h2 className="font-bold mt-4">Банковские реквизиты:</h2>
                <p>
                  <strong>Номер карты:</strong>{" "}
                  {user.bankDetails?.cardNumber || "Не указано"}
                </p>
                <p>
                  <strong>Номер счета:</strong>{" "}
                  {user.bankDetails?.accountNumber || "Не указано"}
                </p>
                <p>
                  <strong>Корреспондентский счет:</strong>{" "}
                  {user.bankDetails?.corrAccount || "Не указано"}
                </p>
                <p>
                  <strong>БИК:</strong> {user.bankDetails?.bic || "Не указано"}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                {!user.admin && (
                  <>
                    {user.isConfirmed ? (
                      <button
                        onClick={() => disconfirm(user.userId)}
                        className="bg-red-500 text-white rounded-lg p-2 rounded-xl"
                      >
                        Отменить подтверждение
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => confirm(user.userId)}
                          className="bg-blue-600 rounded-xl text-white p-2 transition hover:scale-105"
                        >
                          Подтвердить
                        </button>
                        <button
                          onClick={() => disconfirm(user.userId)}
                          className="bg-red-500 text-white rounded-lg p-2 rounded-xl"
                        >
                          Не подтверждать
                        </button>
                      </>
                    )}
                  </>
                )}
                {user.admin ? (
                  <button
                    onClick={() => removeAdmin(user.userId)}
                    className="bg-red-500 rounded-xl text-white p-2 transition hover:scale-105"
                  >
                    Исключить из Администраторов
                  </button>
                ) : (
                  <button
                    onClick={() => addAdmin(user.userId)}
                    className="bg-blue-600 rounded-xl text-white p-2 transition hover:scale-105"
                  >
                    Сделать Администратором
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Orders;
