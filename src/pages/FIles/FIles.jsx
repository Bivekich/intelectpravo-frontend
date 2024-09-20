import axios from "axios";
import Cookies from "universal-cookie";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const Files = () => {
  const cookies = new Cookies();
  const token = cookies.get("token"); // Get the token from cookies
  const [files, setFiles] = useState([]); // Initialize state to store fetched files
  const location = useLocation();

  // Get the query params from the URL
  const searchParams = new URLSearchParams(location.search);
  const page = searchParams.get("page") || 0; // Default to page 1 if not specified

  console.log(page);
  useEffect(() => {
    const fetchFiles = async () => {
      const response = await axios({
        method: "get",
        url: `http://localhost:3000/sale/user-boughts`, // Pass limit and offset as query params
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data) {
        return response.data;
      }
    };
    fetchFiles();
  }, [token]); // Dependency array includes token to re-fetch if it changes

  return (
    <>
      <div className="flex flex-col gap-5">
        {files && files.length > 0 ? (
          files.map((item, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 justify-start rounded-xl border-2 px-5 py-3"
            >
              <p className="w-full text-2xl">{item.title}</p>
              <p className="w-fit">Описание: {item.description}</p>
              <p className="w-fit">Цена: {item.price}</p>
              <p className="w-fit">
                Тип: {item.saleType == "rights" ? "Права" : "Лицензия"}
              </p>
              {item.saleType != "rights" && (
                <>
                  <p className="w-fit">
                    Эксклюзивный: {item.isExclusive ? "Да" : "Нет"}
                  </p>
                  <p className="w-fit">Срок лицензии: {item.licenseTerm}</p>
                </>
              )}
              <a className="w-fit" href={item.fileUrl} target="_blank" download>
                Файл
              </a>
              <p className="w-full text-xl">Реквизиты</p>
              <p className="w-fit">Рассчетный счёт: {item.accountNumber} </p>
              <button type="button" className="border-2 border-gray-300">
                Оплатить
              </button>
            </div>
          ))
        ) : (
          <p>No sales available.</p>
        )}
      </div>
    </>
  );
};

export default Files;
