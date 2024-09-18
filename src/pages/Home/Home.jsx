import { Cookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const cookies = new Cookies();
  const token = cookies.get("token");
  const navigate = useNavigate();

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
        if (response.data) {
          if (response.data.isConfirmed) {
            navigate("/profile");
          } else {
            navigate("/profile/confirm");
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [token]);
};
export default Home;
