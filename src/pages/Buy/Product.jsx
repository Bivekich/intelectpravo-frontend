import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "universal-cookie";
import Loader from "../../components/Loader";

const Product = () => {
  const cookies = new Cookies();
  const token = cookies.get("token");
  const phoneNumber = cookies.get("phone");
  const { pid } = useParams();
  const [item, setItem] = useState([]);
  const [message, setMessage] = useState([]);
  const [pay, setPay] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAndFetchData = async () => {
      const storedProductId = localStorage.getItem("product");

      if (storedProductId !== pid) {
        try {
          // Verify action using the phone number from cookies
          const response = await axios.post(
            "https://api.intelectpravo.ru/profile/verify-action",
            { phoneNumber }, // Send phone number
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log("Response:", response.data);
          localStorage.setItem("lastpage", "/buy");

          localStorage.setItem("producttobuy", pid);
          navigate("/profile/confirmaction/buyproduct"); // Change this to your desired route
          return;
        } catch (error) {
          console.error("Verification failed:", error);
        }
      }

      // Fetch profile data for the sale
      try {
        const saleResponse = await axios.get(
          `https://api.intelectpravo.ru/sale/user-buy?sid=${pid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(saleResponse);
        setItem(saleResponse.data.sale);

        if (saleResponse.data.sale.userBought != null) {
          setMessage("Файл снят с продажи");
          setPay(false);
        }
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };

    verifyAndFetchData();
  }, [pid, token, phoneNumber, navigate]);

  const handlePaid = (e) => {
    e.preventDefault();
    axios({
      method: "get",
      url: `https://api.intelectpravo.ru/sale/user-markPaid?sid=${pid}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        console.log(response);
        setMessage(response.data.message);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="flex flex-col gap-2 justify-start rounded-xl border-2 px-5 py-3">
      {loading ? (
        <Loader /> // Отображаем прелоадер, пока идет загрузка
      ) : (
        <>
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

          {pay && (
            <>
              <p className="w-full text-xl">Договор</p>
              <a
                className="w-fit"
                href={item.contractUrl}
                target="_blank"
                download
              >
                (Договор)
              </a>
              <button
                type="button"
                className="border-2 border-gray-300 py-2 rounded-xl text-gray-600 dark:text-white"
                onClick={handlePaid}
              >
                Я оплатил
              </button>
            </>
          )}
          {message && <span className="text-xl font-semibold">{message}</span>}
        </>
      )}
    </div>
  );
};

export default Product;
