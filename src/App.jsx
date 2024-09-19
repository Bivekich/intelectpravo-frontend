import "./App.css";
import Layout from "./layouts/Layout";
import SingIn from "./pages/Auth/Signin";
import SingUp from "./pages/Auth/Signup";
import Auth from "./pages/Auth/Auth";
import Profile from "./pages/Profile/Profile";
import Confirm from "./pages/Profile/Confirm";
import Bank from "./pages/Profile/Bank";
import Home from "./pages/Home/Home";
import Sell from "./pages/Sell/Sell";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/singin" element={<SingIn />} />
            <Route path="/singup" element={<SingUp />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/confirm" element={<Confirm />} />
            <Route path="/profile/bank" element={<Bank />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
