import { useState } from 'react';
import Input from '../../components/Input';
import axios from 'axios';
import Cookies from 'universal-cookie';
import md5 from 'md5';
import { useNavigate } from 'react-router-dom';
import AlertModal from '../../components/AlertModal';

const Password = () => {
  const cookies = new Cookies();
  const token = cookies.get('token');
  const phone = cookies.get('phone');
  const navigate = useNavigate();
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push('Пароль должен содержать не менее 8 символов.');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Пароль должен содержать хотя бы одну заглавную букву.');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Пароль должен содержать хотя бы одну строчную букву.');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Пароль должен содержать хотя бы одну цифру.');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push(
        'Пароль должен содержать хотя бы один специальный символ (!@#$%^&*).'
      );
    }
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === 'newPassword') {
      const errors = validatePassword(value);
      setPasswordErrors(errors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Новые пароли не совпадают');
      return;
    }

    if (passwordErrors.length > 0) {
      setError(passwordErrors.join(' '));
      return;
    }

    setError('');

    try {
      const verifyResponse = await axios.post(
        'https://api.intelectpravo.ru/profile/verify-action',
        { phoneNumber: phone },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (verifyResponse.status === 200) {
        setShowConfirmation(true);
      }
    } catch (error) {
      console.error('Ошибка при отправке кода:', error);
      setError('Произошла ошибка при отправке кода подтверждения');
    }
  };

  const handleConfirmCode = async () => {
    try {
      const checkResponse = await axios.post(
        'https://api.intelectpravo.ru/profile/check-verify-action',
        {
          phoneNumber: phone,
          code: code,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (checkResponse.status === 200) {
        const changeResponse = await axios.post(
          'https://api.intelectpravo.ru/profile/change-password',
          {
            newPassword: md5(passwordData.newPassword),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (changeResponse.status === 200) {
          navigate('/profile/?info=3');
        }
      }
    } catch (error) {
      console.error('Ошибка при подтверждении кода:', error);
      if (error.response && error.response.data) {
        setError(error.response.data.message);
      } else {
        setError('Произошла ошибка при подтверждении кода');
      }
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowPasswordConfirmation = () => {
    setShowPasswordConfirmation(!showPasswordConfirmation);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 px-10 py-5 border-2 rounded-2xl max-w-[400px] w-full"
    >
      <h3 className="font-semibold text-xl">Изменение пароля</h3>
      <div className="relative">
        <Input
          label="Новый пароль"
          type={showPassword ? 'text' : 'password'}
          name="newPassword"
          value={passwordData.newPassword}
          onChange={handleInputChange}
          required
        />
        <button
          type="button"
          onClick={toggleShowPassword}
          className="absolute right-0 top-1/2 transform bg-transparent -translate-y-1/2 text-blue-500 border-0"
          aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
        >
          {showPassword ? (
            <svg
              width="20px"
              height="20px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.99902 3L20.999 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 11.9992 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5"
                stroke="#535bf2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              width="20px"
              height="20px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.0007 12C15.0007 13.6569 13.6576 15 12.0007 15C10.3439 15 9.00073 13.6569 9.00073 12C9.00073 10.3431 10.3439 9 12.0007 9C13.6576 9 15.0007 10.3431 15.0007 12Z"
                stroke="#535bf2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.0012 5C7.52354 5 3.73326 7.94288 2.45898 12C3.73324 16.0571 7.52354 19 12.0012 19C16.4788 19 20.2691 16.0571 21.5434 12C20.2691 7.94291 16.4788 5 12.0012 5Z"
                stroke="#535bf2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
      <div className="relative">
        <Input
          label="Подтвердите новый пароль"
          type={showPasswordConfirmation ? 'text' : 'password'}
          name="confirmPassword"
          value={passwordData.confirmPassword}
          onChange={handleInputChange}
          required
        />
        <button
          type="button"
          onClick={toggleShowPasswordConfirmation}
          className="absolute right-0 top-1/2 transform bg-transparent -translate-y-1/2 text-blue-500 border-0"
          aria-label={
            showPasswordConfirmation ? 'Скрыть пароль' : 'Показать пароль'
          }
        >
          {showPasswordConfirmation ? (
            <svg
              width="20px"
              height="20px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.99902 3L20.999 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 11.9992 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5"
                stroke="#535bf2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              width="20px"
              height="20px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.0007 12C15.0007 13.6569 13.6576 15 12.0007 15C10.3439 15 9.00073 13.6569 9.00073 12C9.00073 10.3431 10.3439 9 12.0007 9C13.6576 9 15.0007 10.3431 15.0007 12Z"
                stroke="#535bf2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.0012 5C7.52354 5 3.73326 7.94288 2.45898 12C3.73324 16.0571 7.52354 19 12.0012 19C16.4788 19 20.2691 16.0571 21.5434 12C20.2691 7.94291 16.4788 5 12.0012 5Z"
                stroke="#535bf2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
      {error && <span className="text-red-600">{error}</span>}
      <button
        type="submit"
        className="bg-blue-600 rounded-xl text-white transition hover:scale-105"
      >
        Изменить пароль
      </button>
      {showConfirmation && (
        <AlertModal
          title="Вы точно хотите изменить пароль?"
          message=""
          onConfirm={handleConfirmCode}
          onCancel={() => setShowConfirmation(!showConfirmation)}
        />
      )}
    </form>
  );
};

export default Password;
