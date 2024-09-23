import axios from "axios";
import Cookies from "universal-cookie";
import React, { useState, useEffect } from "react";
import { useLocation, Navigate } from "react-router-dom";
import Loader from "../../components/Loader";
import Paginator from "../../components/Paginator";
// import { Input } from "postcss";
import Input from "../../components/Input";

const getItems = async (limit, offset, token, search = "") => {
  try {
    // Формируем параметры запроса
    const params = new URLSearchParams({
      limit,
      offset,
    });

    // Добавляем параметр search, если он задан
    if (search) {
      params.append("search", search);
    }

    // Выполняем запрос с переданными параметрами
    const response = await axios({
      method: "get",
      url: `http://localhost:3000/sale/sales?${params.toString()}`, // Динамическое создание query-параметров
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Возвращаем данные, если они есть
    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.error(
      "Error fetching items:",
      error.response ? error.response.data : error.message
    );
  }
};

const Buy = () => {
  const cookies = new Cookies();
  const token = cookies.get("token"); // Get the token from cookies
  const [files, setFiles] = useState([]); // Initialize state to store fetched files
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearchInput] = useState(searchParams.get("search") || "");

  const page = searchParams.get("page") || 0; // Default to page 1 if not specified

  console.log(page);
  useEffect(() => {
    const fetchFiles = async () => {
      const items = await getItems(page * 10 + 10, page * 10, token, search); // Fetch 10 items with offset 0
      setFiles(items.sales); // Update state with fetched items
      setTotalPages(Math.ceil(items.count / 10));
      setLoading(false);
    };
    fetchFiles();
  }, [token]); // Dependency array includes token to re-fetch if it changes

  const handlePageChange = () => {
    const nextPage = page + 1;
    if (nextPage < totalPages) {
      Navigate(`/buy/?page=${nextPage}`);
    }
  };

  const handleSearchInput = (e) => {
    setSearchInput(e.target.value);
  };
  const handleSearch = async () => {
    const items = await getItems(page * 10 + 10, page * 10, token, search); // Fetch 10 items with offset 0
    setFiles(items.sales); // Update state with fetched items
    setTotalPages(Math.ceil(items.count / 10));
    setLoading(false);
  };

  return loading ? (
    <div className="flex flex-col mx-auto gap-5 px-10 py-5 border-2 rounded-2xl max-w-[400px] w-full">
      <Loader />
    </div>
  ) : (
    <>
      <div className="flex flex-col gap-5">
        <form
          action=""
          onSubmit={handleSearch}
          className="flex flex-row flex-nowrap gap-5 w-full"
        >
          <Input
            type="text"
            label="Поиск"
            name="search"
            onChange={handleSearchInput}
          />
          <button
            type="submit"
            className="bg-blue-600 rounded-xl text-white transition hover:scale-105"
          >
            Найти
          </button>
        </form>
        {files && files.length > 0 ? (
          <>
            {files.map((item, index) => (
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
                <a
                  className="w-fit"
                  href={item.fileUrl}
                  target="_blank"
                  download
                >
                  Файл
                </a>
                <p className="w-full text-xl">Реквизиты</p>
                <p className="w-fit">Рассчетный счёт: {item.accountNumber} </p>
                {!item.isMy ? (
                  <a
                    href={`buy/product/${item.id}`}
                    type="button"
                    className="border-2 border-gray-300 py-2 rounded-xl text-gray-700 dark:text-white"
                  >
                    Купить
                  </a>
                ) : (
                  <span className="border-2 border-gray-300 py-2 rounded-xl text-gray-700 dark:text-white">
                    Это Ваше произведение
                  </span>
                )}
              </div>
            ))}
            <Paginator
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <p>Нет файлов на продаже</p>
        )}
      </div>
    </>
  );
};

export default Buy;
