import { useState } from "react";
import axios from "axios"; // Import axios
import Input from "../../components/Input";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const SignUp = () => {
  const cookies = new Cookies();
  const [code, setCode] = useState(""); // Initialize state with an empty string
  const [message, setMessage] = useState(""); // Initialize state with an empty string
  const email = cookies.get("email");
  const navigate = useNavigate(); // Initialize navigate

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    try {
      const response = await axios.post(
        "https://api.intelectpravo.ru/auth/verify",
        {
          email: email,
          code: code,
        }
      );

      // Successful response, status will be 2xx
      console.log(response);
      if (response.status === 200) {
        cookies.set("token", response.data.token, { path: "/" });
        navigate("/");
      }
    } catch (error) {
      // Handle other errors or network issues
      console.error("An error occurred:", error);
      setMessage(error.response.data.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 px-10 py-5 border-2 rounded-2xl max-w-[400px] w-full"
    >
      <h3 className="font-semibold text-xl">
        Введите код подтверждения, который был отправлен Вам на почту: {email}
      </h3>
      {message != "" && <span>{message}</span>}
      <Input
        label="Код"
        type="text"
        name="code"
        value={code}
        onChange={(e) => setCode(e.target.value)} // Proper onChange handler
        required
      />
      <button
        type="submit"
        className="bg-blue-600 rounded-xl text-white transition hover:scale-105"
      >
        Войти
      </button>
    </form>
  );
};

export default SignUp;
