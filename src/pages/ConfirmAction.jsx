import { useEffect, useState } from "react";
import axios from "axios"; // Import axios
import Input from "../components/Input";
import Cookies from "universal-cookie";
import { useNavigate, useParams } from "react-router-dom"; // Import useNavigate

const ConfirmAction = () => {
  const { action } = useParams();
  const cookies = new Cookies();
  const [code, setCode] = useState(""); // Initialize state with an empty string
  const [message, setMessage] = useState(""); // Initialize state with an empty string
  const phone = cookies.get("phone");
  const token = cookies.get("token");
  const navigate = useNavigate(); // Initialize navigate

  const base64ToBlob = (base64, contentType = "") => {
    const byteCharacters = atob(base64.split(",")[1]); // Decode Base64
    const byteNumbers = new Uint8Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    return new Blob([byteNumbers], { type: contentType });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    try {
      const response = await axios.post(
        "http://localhost:3000/profile/check-verify",
        {
          phoneNumber: phone,
          code: code,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Successful response, status will be 2xx
      console.log(response);
      if (response.status === 200) {
        // Proceed to update profile if action matches
        if (action === "updateprofile") {
          const profileData = JSON.parse(localStorage.getItem("profileData"));
          const updateResponse = await axios.post(
            "http://localhost:3000/profile/update",
            profileData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log(profileData);
          console.log(updateResponse);

          const documentPhoto = localStorage.getItem("documentPhoto");
          if (documentPhoto) {
            const formData = new FormData();

            // Convert Base64 to Blob
            const blob = base64ToBlob(documentPhoto, "image/jpeg"); // Specify the correct content type
            formData.append("documentPhoto", blob, "document.jpg"); // Append Blob to FormData

            const huy = await axios.post(
              "http://localhost:3000/profile/upload-photo",
              formData,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "multipart/form-data",
                },
              }
            );
            console.log(huy);
          }

          // Clear local storage
          localStorage.removeItem("profileData");
          localStorage.removeItem("documentPhoto");
          navigate("/profile/confirm");
        } else if (action == "updatebank") {
          const payments = JSON.parse(localStorage.getItem("paymentsData"));
          const response = await axios.post(
            "http://localhost:3000/profile/bank-details",
            payments,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log(response);
          localStorage.removeItem("paymentsData");
          navigate("/profile/bank");
        }
      }
    } catch (error) {
      // Handle other errors or network issues
      console.error("An error occurred:", error);
      setMessage(error.response?.data?.message || "Произошла ошибка."); // Display error message
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 px-10 py-5 border-2 rounded-2xl max-w-[400px] w-full"
    >
      <h3 className="font-semibold text-xl">
        Введите код подтверждения, который был отправлен Вам на телефон: {phone}
      </h3>
      {message && <span>{message}</span>} {/* Only show message if not empty */}
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
        Подтвердить
      </button>
    </form>
  );
};

export default ConfirmAction;
