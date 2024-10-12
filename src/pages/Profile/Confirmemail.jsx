import { useState, useEffect } from "react";
import Input from "../../components/Input";
import Cookies from "universal-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const ConfirmEmail = () => {
  const cookies = new Cookies();
  const token = cookies.get("token");
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const email = searchParams.get("email");
  if (!email) {
    navigate("/profile/changemail");
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    // confirm-email
    try {
      // Submit profile data
      const response = await axios.post(
        `http://localhost:3000/profile/confirm-email`,
        {
          email: email,
          code: code,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);
      setMessage("Почта успешно изменена");
    } catch (error) {
      if (error.status) {
        setMessage(error.response.data.message);
      }
      console.log(error);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 px-10 mx-auto py-5 border-2 rounded-2xl max-w-[400px] w-full"
    >
      <h3 className="font-semibold text-xl">
        Введите код, который пришел Вам на почту
      </h3>
      {message && <span>{message}</span>}
      <Input
        label="Код"
        type="code"
        name="code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
      />
      <button
        type="submit"
        className="bg-blue-600 rounded-xl text-white transition hover:scale-105"
      >
        Подтвердить новую почту
      </button>
    </form>
  );
};

export default ConfirmEmail;
