import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Layout = () => {
  return (
    <>
      <div className="my-auto border-2 rounded-2xl max-w-screen w-full h-full flex items-center justify-start relative p-5 flex-col">
        <Header />
        <Outlet />
        <Footer />
      </div>
    </>
  );
};

export default Layout;
