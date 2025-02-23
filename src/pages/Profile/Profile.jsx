import axios from 'axios';
import Input from '../../components/Input';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Cookies from 'universal-cookie';
import React, { useState, useEffect } from 'react';
import AcceptAll from '../../components/AcceptAll';
import AlertInfoModal from '../../components/AlertInfoModal'; // Import the new AlertModal component

const Profile = () => {
  const cookies = new Cookies();
  const token = cookies.get('token');
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Access parameters using queryParams.get('parameterName')
  const [info, setInfo] = useState(queryParams.get('info') || 0); // replace 'myParam' with your parameter name

  const [profile, setProfile] = useState({
    name: '',
    surname: '',
    patronymic: '',
    email: '',
    phoneNumber: '',
    birthDate: '',
    passportSeries: '',
    passportNumber: '',
    address: '',
    passportIssuedDate: '',
    passportIssuedBy: '',
    documentPhoto: null,
  });

  const [payments, setPayments] = useState({
    cardNumber: '',
    accountNumber: '',
    corrAccount: '',
    bic: '',
  });

  const allFieldsFilled = () => {
    const { isConfirmed, admin, toSend, inoy, ...otherProfileFields } = profile;

    // Check that `isConfirmed` and `toSend` are false and all other profile fields are truthy
    const allProfileFieldsFilled =
      !isConfirmed &&
      !toSend &&
      (Object.values(otherProfileFields).every((field) => field) || inoy);

    // Check payment conditions
    const isPaymentFilled =
      payments.cardNumber ||
      (payments.corrAccount && payments.bic && payments.accountNumber) ||
      (payments.cardNumber &&
        payments.corrAccount &&
        payments.bic &&
        payments.accountNumber);
    console.log('inoy ' + inoy);
    console.log('allProfileFieldsFilled ' + allProfileFieldsFilled);

    return allProfileFieldsFilled && isPaymentFilled;
  };

  useEffect(() => {
    // Fetch profile data
    axios({
      method: 'get',
      url: 'https://api.intelectpravo.ru/profile/basic',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        setProfile(response.data);
        console.log(response.data);
        setMessage(
          response.data.isConfirmed
            ? 'Подтвержденная учётная запись'
            : 'Чтобы подтвердить профиль, необходимо заполнить все поля формы "Полная информация" и все поля формы "Реквизиты", после их заполнения Ваш профиль будет направлен администратору сайта на проверку'
        );
        if (response.data.toSend && !response.data.isConfirmed) {
          setMessage(
            'Ваш профиль отправлен на подтверждение администраторам сайта. Ожидайте'
          );
        }
        setConfirmed(response.data.isConfirmed);
      })
      .catch((error) => {
        console.log(error);
      });

    // Fetch bank details data
    axios({
      method: 'get',
      url: 'https://api.intelectpravo.ru/profile/bank-details',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        setPayments(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [token]);

  const handleSubmitForConfirmation = async () => {
    try {
      const response = await axios.post(
        'https://api.intelectpravo.ru/profile/verify-action',
        { phoneNumber: profile.phoneNumber }, // Send phone number
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Response:', response.data);
      localStorage.setItem('lastpage', '/profile');
      navigate('/profile/confirmaction/submitProfile');
    } catch (error) {
      console.error(error);
    }
  };

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  return (
    <>
      <form className="flex flex-col gap-5 px-10 mx-auto py-5 border-2 rounded-2xl max-w-[600px] w-full">
        <h3 className="font-semibold text-xl">Учётная запись</h3>
        <h3 className="font-semibold text-xl mt-5">
          Паспортные и контактные данные
        </h3>

        {/* Profile Information */}
        {profile.email && (
          <Input
            label="Электронная почта"
            type="email"
            name="email"
            value={profile.email}
            readOnly
          />
        )}

        {profile.surname && (
          <Input
            label="Фамилия"
            type="text"
            name="surname"
            value={profile.surname}
            readOnly
          />
        )}

        {profile.name && (
          <Input
            label="Имя"
            type="text"
            name="name"
            value={profile.name}
            readOnly
          />
        )}

        {profile.patronymic && (
          <Input
            label="Отчество"
            type="text"
            name="patronymic"
            value={profile.patronymic}
            readOnly
          />
        )}

        {profile.phoneNumber && (
          <Input
            label="Номер телефона"
            type="text"
            name="phoneNumber"
            value={profile.phoneNumber}
            readOnly
          />
        )}

        {profile.address && (
          <Input
            label="Адрес"
            type="text"
            name="address"
            value={profile.address}
            readOnly
          />
        )}

        {profile.birthDate && (
          <Input
            label="Дата рождения"
            type="date"
            name="birthDate"
            value={formatDateForInput(profile.birthDate) || ''}
            readOnly
          />
        )}

        {/* Passport Details */}
        {!profile.inoy && (
          <>
            {profile.passportSeries && (
              <Input
                label="Серия паспорта"
                type="text"
                name="passportSeries"
                value={profile.passportSeries}
                readOnly
              />
            )}

            {profile.passportNumber && (
              <Input
                label="Номер паспорта"
                type="text"
                name="passportNumber"
                value={profile.passportNumber}
                readOnly
              />
            )}

            {profile.passportCode && (
              <Input
                label="Код подразделения"
                type="text"
                name="passportCode"
                value={profile.passportCode}
                readOnly
              />
            )}

            {profile.passportIssuedDate && (
              <Input
                label="Дата выдачи"
                type="text"
                name="passportIssuedDate"
                value={new Date(
                  profile.passportIssuedDate
                ).toLocaleDateString()}
                readOnly
              />
            )}

            {profile.passportIssuedBy && (
              <Input
                label="Кем выдан"
                type="text"
                name="passportIssuedBy"
                value={profile.passportIssuedBy}
                readOnly
              />
            )}
          </>
        )}

        {profile.inoy && (
          <Input
            label="Иное"
            type="text"
            name="inoy"
            value={profile.inoy}
            readOnly
          />
        )}

        {profile.documentPhoto && (
          <>
            <span>Фото документа, удостоверяющего личность</span>
            <div className="flex flex-col gap-3">
              {typeof profile.documentPhoto === 'string' ? (
                <img src={profile.documentPhoto} alt="Uploaded Document" />
              ) : (
                <p>{profile.documentPhoto.name}</p>
              )}
            </div>
          </>
        )}

        {/* Bank Details */}
        {(payments.cardNumber ||
          payments.accountNumber ||
          payments.corrAccount ||
          payments.bic) && (
          <h3 className="font-semibold text-xl mt-5">Банковские реквизиты</h3>
        )}

        {payments.cardNumber && (
          <Input
            label="Номер банковской карты"
            type="text"
            name="cardNumber"
            value={payments.cardNumber}
            readOnly
          />
        )}

        {payments.accountNumber && (
          <Input
            label="Расчетный счет"
            type="text"
            name="accountNumber"
            value={payments.accountNumber}
            readOnly
          />
        )}

        {payments.corrAccount && (
          <Input
            label="Корреспондентский счет"
            type="text"
            name="corrAccount"
            value={payments.corrAccount}
            readOnly
          />
        )}

        {payments.bic && (
          <Input
            label="БИК банка"
            type="text"
            name="bic"
            value={payments.bic}
            readOnly
          />
        )}

        <Link
          to="/profile/confirm"
          className="rounded-xl p-2 border-2 border-[#e5e7eb] text-gray-500 transition hover:scale-105 hover:text-gray-500"
        >
          Редактировать паспортные и контактные данные
        </Link>
        <Link
          to="/profile/bank"
          className="rounded-xl p-2 border-2 border-[#e5e7eb] text-gray-500 transition hover:scale-105 hover:text-gray-500"
        >
          Редактировать банковские реквизиты
        </Link>
        <Link
          to="/profile/changepass"
          className="rounded-xl p-2 border-2 border-[#e5e7eb] text-gray-500 transition hover:scale-105 hover:text-gray-500"
        >
          Изменить пароль учётной записи
        </Link>

        {message && <span>{message}</span>}

        {/* Conditionally display submit button */}
        {allFieldsFilled() && (
          <>
            <AcceptAll name="accept" />
            <button
              type="button"
              onClick={handleSubmitForConfirmation}
              className="bg-green-600 rounded-xl text-white transition hover:scale-105"
            >
              Отправить данные для создания подтвержденной учётной записи
              администратору
            </button>
          </>
        )}

        <Link
          to="/"
          className="bg-gray-300 text-gray-600 rounded-xl text-white p-2 transition hover:scale-105 hover:text-gray-600"
        >
          Вернуться в личный кабинет
        </Link>

        <div className="border-t pt-5 mt-2">
          <h3 className="font-semibold text-xl mb-3">Документы</h3>
          <div className="flex flex-col gap-2">
            <a
              href="/documents/public-offer.pdf"
              target="_blank"
              className="text-blue-600 hover:underline flex items-center gap-2"
              rel="noopener noreferrer"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z"
                  stroke="#2563EB"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13 2V9H20"
                  stroke="#2563EB"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Публичная оферта
            </a>
            <a
              href="/documents/electronic-signature.pdf"
              target="_blank"
              className="text-blue-600 hover:underline flex items-center gap-2"
              rel="noopener noreferrer"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z"
                  stroke="#2563EB"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13 2V9H20"
                  stroke="#2563EB"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Соглашение об использовании простой электронной подписи
            </a>
          </div>
        </div>
      </form>
      {info == 1 && (
        <AlertInfoModal
          title="Паспортные и контактные данные были
          изменены"
          message=""
          onConfirm={() => setInfo(0)}
        />
      )}
      {info == 2 && (
        <AlertInfoModal
          title="Банковские реквизиты успешно обновлены."
          message=""
          onConfirm={() => setInfo(0)}
        />
      )}
      {info == 3 && (
        <AlertInfoModal
          title="Пароль успешно изменен"
          message=""
          onConfirm={() => setInfo(0)}
        />
      )}
    </>
  );
};

export default Profile;
