import { useState, useEffect } from "react";
import Input from "../../components/Input";
import Cookies from "universal-cookie";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Email = () => {
  const cookies = new Cookies();
  const token = cookies.get("token");
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    surname: "",
    patronymic: "",
    email: "",
    phoneNumber: "",
    birthDate: "",
    passportSeries: "",
    passportNumber: "",
    address: "",
    passportIssuedDate: "",
    passportIssuedBy: "",
    documentPhoto: null,
  });
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
        setProfile(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [token]);
  const HandleInput = (e) => {
    const { name, value } = e.target;
    const updatedProfile = {
      ...profile,
      [name]: value,
    };
    setProfile(updatedProfile);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    // confirm-email
    try {
      // Submit profile data
      const response = await axios.get(
        `https://api.intelectpravo.ru/profile/confirm-email-code?email=${profile.email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log(response);
      // Redirect to the homepage
      navigate(`/profile/confirmemail/?email=${profile.email}`); // This will redirect the user to the homepage
      // Optionally navigate or show a success message here
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 px-10 mx-auto py-5 border-2 rounded-2xl max-w-[400px] w-full"
    >
      <h3 className="font-semibold text-xl">Изменение почты</h3>
      <Input
        label="Email"
        type="email"
        name="email"
        value={profile.email}
        onChange={HandleInput}
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

export default Email;
