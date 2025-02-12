import './App.css';
import Layout from './layouts/Layout';
import Signin from './pages/Auth/Signin';
import Signup from './pages/Auth/Signup';
import Auth from './pages/Auth/Auth';
import Profile from './pages/Profile/Profile';
import Confirm from './pages/Profile/Confirm';
import Bank from './pages/Profile/Bank';
import Home from './pages/Home/Home';
import Sell from './pages/Sell/Sell';
import Buy from './pages/Buy/Buy';
import Product from './pages/Buy/Product';
import Files from './pages/FIles/FIles';
import Password from './pages/Profile/Password';
import LogInByPass from './pages/Auth/LogInByPass';
import Email from './pages/Profile/Email';
import ConfirmEmail from './pages/Profile/Confirmemail';
import ConfirmAction from './pages/ConfirmAction';
import Orders from './pages/Ordes/Orders';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/buy" element={<Buy />} />
            <Route path="/buy/product/:pid" element={<Product />} />
            <Route path="/files" element={<Files />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/loginbypass" element={<LogInByPass />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/confirm" element={<Confirm />} />
            <Route path="/profile/bank" element={<Bank />} />
            <Route path="/profile/changepass" element={<Password />} />
            <Route path="/profile/changemail" element={<Email />} />
            <Route path="/profile/confirmemail" element={<ConfirmEmail />} />
            <Route
              path="/profile/confirmaction/:action"
              element={<ConfirmAction />}
            />
            <Route path="/orders" element={<Orders />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
