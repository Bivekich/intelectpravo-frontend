import axios from "axios";
import Cookies from "universal-cookie";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const Files = () => {
  const cookies = new Cookies();
  const token = cookies.get("token"); // Get the token from cookies
  const [files_boughts, setBoughtsFiles] = useState([]); // Initialize state to store fetched files
  const [files_selled, setSelledFiles] = useState([]); // Initialize state to store fetched files
  const [files_my, setMyFiles] = useState([]); // Initialize state to store fetched files
  const location = useLocation();

  // Get the query params from the URL
  const searchParams = new URLSearchParams(location.search);
  const page = searchParams.get("page") || 0; // Default to page 1 if not specified

  console.log(page);
  useEffect(() => {
    const fetchFiles = async () => {
      const response_boughts = await axios({
        method: "get",
        url: `http://localhost:3000/sale/user-boughts`, // Pass limit and offset as query params
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response_boughts.data) {
        setBoughtsFiles(response_boughts.data);
      }
      const response_selled = await axios({
        method: "get",
        url: `http://localhost:3000/sale/user-selled`, // Pass limit and offset as query params
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response_selled.data) {
        setSelledFiles(response_selled.data);
      }
      const response_myfiles = await axios({
        method: "get",
        url: `http://localhost:3000/sale/user-sales`, // Pass limit and offset as query params
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response_myfiles.data) {
        setMyFiles(response_myfiles.data);
      }
    };
    fetchFiles();
  }, [token]); // Dependency array includes token to re-fetch if it changes

  return (
    <>
      <div className="flex flex-row gap-5 w-[90vw] flex-wrap md:flex-nowrap lg:flex-nowrap">
        <div className="flex flex-col w-full mt-10 md:w-1/2 lg:w-1/3 gap-5">
          <div className="flex flex-col gap-2 justify-start rounded-xl border-2 px-5 py-3 w-full">
            <span className="text-xl font-bold">Купленные файлы</span>
          </div>
          {files_boughts && files_boughts.length > 0 ? (
            files_boughts.map((item, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 justify-start rounded-xl border-2 px-5 py-3 w-full"
              >
                <p className="w-full text-2xl">{item.title}</p>
                <p className="w-fit text-start">Описание: {item.description}</p>
                <p className="w-fit text-start">Цена: {item.price}</p>
                <p className="w-fit text-start">
                  Тип: {item.saleType == "rights" ? "Права" : "Лицензия"}
                </p>
                {item.saleType != "rights" && (
                  <>
                    <p className="w-fit text-start">
                      Эксклюзивный: {item.isExclusive ? "Да" : "Нет"}
                    </p>
                    <p className="w-fit text-start">
                      Срок лицензии: {item.licenseTerm}
                    </p>
                  </>
                )}
                <a
                  className="w-fit"
                  href={item.fileUrl}
                  target="_blank"
                  download
                >
                  Файл
                </a>
                <p className="w-full text-xl">Реквизиты</p>
                <p className="w-fit text-start">
                  Рассчетный счёт: {item.accountNumber}{" "}
                </p>
                <p className="w-full text-xl">Договор</p>
                <a
                  className="w-fit"
                  href={item.contractUrl}
                  target="_blank"
                  download
                >
                  (Договор)
                </a>
              </div>
            ))
          ) : (
            <p className="flex flex-col gap-2 justify-start rounded-xl border-2 px-5 py-3 w-full">
              Нет Купленых файлов
            </p>
          )}
        </div>
        <div className="flex flex-col w-full mt-10 gap-5 md:w-1/2 lg:w-1/3">
          <div className="flex flex-col gap-2 justify-start rounded-xl border-2 px-5 py-3 w-full">
            <span className="text-xl font-bold">Проданные файлы</span>
          </div>
          {files_selled && files_selled.length > 0 ? (
            files_selled.map((item, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 justify-start rounded-xl border-2 px-5 py-3 w-full"
              >
                <p className="w-full text-2xl">{item.title}</p>
                <p className="w-fit text-start">Описание: {item.description}</p>
                <p className="w-fit text-start">Цена: {item.price}</p>
                <p className="w-fit text-start">
                  Тип: {item.saleType == "rights" ? "Права" : "Лицензия"}
                </p>
                {item.saleType != "rights" && (
                  <>
                    <p className="w-fit text-start">
                      Эксклюзивный: {item.isExclusive ? "Да" : "Нет"}
                    </p>
                    <p className="w-fit text-start">
                      Срок лицензии: {item.licenseTerm}
                    </p>
                  </>
                )}
                <a
                  className="w-fit"
                  href={item.fileUrl}
                  target="_blank"
                  download
                >
                  Файл
                </a>
                <p className="w-full text-xl">Реквизиты</p>
                <p className="w-fit text-start">
                  Рассчетный счёт: {item.accountNumber}{" "}
                </p>
                <p className="w-full text-xl">Договор</p>
                <a
                  className="w-fit"
                  href={item.contractUrl}
                  target="_blank"
                  download
                >
                  (Договор)
                </a>
              </div>
            ))
          ) : (
            <p className="flex flex-col gap-2 justify-start rounded-xl border-2 px-5 py-3 w-full">
              Нет Проданных файлов
            </p>
          )}
        </div>
        <div className="flex flex-col w-full mt-10 gap-5 md:w-1/2 lg:w-1/3">
          <div className="flex flex-col gap-2 justify-start rounded-xl border-2 px-5 py-3 w-full">
            <span className="text-xl font-bold">Файлы в хранилище</span>
          </div>
          {files_my && files_my.length > 0 ? (
            files_my.map((item, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 justify-start rounded-xl border-2 px-5 py-3 w-full"
              >
                <p className="w-full text-2xl">{item.title}</p>
                <p className="w-fit text-start">Описание: {item.description}</p>
                <p className="w-fit text-start">Цена: {item.price}</p>
                <p className="w-fit text-start">
                  Тип: {item.saleType == "rights" ? "Права" : "Лицензия"}
                </p>
                {item.saleType != "rights" && (
                  <>
                    <p className="w-fit text-start">
                      Эксклюзивный: {item.isExclusive ? "Да" : "Нет"}
                    </p>
                    <p className="w-fit text-start">
                      Срок лицензии: {item.licenseTerm}
                    </p>
                  </>
                )}
                <a
                  className="w-fit"
                  href={item.fileUrl}
                  target="_blank"
                  download
                >
                  Файл
                </a>
                <p className="w-full text-xl">Реквизиты</p>
                <p className="w-fit text-start">
                  Рассчетный счёт: {item.accountNumber}{" "}
                </p>
                <p className="w-full text-xl">Договор</p>
                <a
                  className="w-fit"
                  href={item.contractUrl}
                  target="_blank"
                  download
                >
                  (Договор)
                </a>
              </div>
            ))
          ) : (
            <p className="flex flex-col gap-2 justify-start rounded-xl border-2 px-5 py-3 w-full">
              Нет файлов в хранилище
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Files;
