import axios from 'axios';
import Input from '../../components/Input';
import Cookies from 'universal-cookie';
import React, { useState, useEffect } from 'react';
import FormData from 'form-data';
import Loader from '../../components/Loader';
import { Link } from 'react-router-dom';

const Sell = () => {
  const cookies = new Cookies();
  const phone = cookies.get('phone');
  const token = cookies.get('token');
  const [code, setCode] = useState('');
  const [getCode, setGetCode] = useState(false);
  const [message, setMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [contractUrl, setContractUrl] = useState('');
  const [file, setFile] = useState({
    title: '',
    description: '',
    price: '',
    accountNumber: '',
    saleType: 'rights', // Всегда "rights" для продажи админу
    file: null,
  });

  useEffect(() => {
    const savedData = localStorage.getItem('formData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setFile(parsedData);
    }
  }, []);

  const saveToLocalStorage = (updatedData) => {
    localStorage.setItem('formData', JSON.stringify(updatedData));
  };

  const HandleInput = (e) => {
    const { name, value } = e.target;

    let limitedValue = value;
    if (name === 'price') {
      limitedValue = limitedValue.replace(/[^\d,]/g, '');
      const parts = limitedValue.split(',');
      if (parts[0].length > 8) parts[0] = parts[0].slice(0, 8);
      if (parts[1]) parts[1] = parts[1].slice(0, 2);
      limitedValue = parts.join(',');
    }

    if (name === 'title' && value.length > 100) {
      limitedValue = value.slice(0, 100);
    }
    if (name === 'description' && value.length > 250) {
      limitedValue = value.slice(0, 250);
    }

    const updatedFile = {
      ...file,
      [name]: limitedValue,
    };
    setFile(updatedFile);
    saveToLocalStorage(updatedFile);
    validateForm();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const updatedFile = {
      ...file,
      file: selectedFile,
    };
    setFile(updatedFile);
    saveToLocalStorage(updatedFile);
  };

  const validateForm = () => {
    let formErrors = {};
    if (!file.title) formErrors.title = 'Название произведения обязательно';
    if (!file.description) formErrors.description = 'Описание обязательно';
    if (!file.price || isNaN(file.price.replace(',', '.'))) {
      formErrors.price = 'Цена должна быть числом';
    }
    if (!file.file) formErrors.file = 'Файл обязателен для загрузки';

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'https://api.intelectpravo.ru/profile/check-verify',
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

      if (response.status === 200) {
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file.file);
        formData.append('title', file.title);
        formData.append('description', file.description);
        formData.append('price', file.price);
        formData.append('saleType', 'rights');

        const response1 = await axios.post(
          'https://api.intelectpravo.ru/sale/create',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        if (response1.status === 200) {
          setLoading(false);
          setMessage('Произведение опубликовано на продажу');
          localStorage.removeItem('formData');
        }
      }
    } catch (error) {
      if (error.response?.status === 400) {
        setMessage('Неправильный или просроченный код.');
      }
      console.error(
        'Error:',
        error.response ? error.response.data : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file.file);
      formData.append('title', file.title);
      formData.append('description', file.description);
      formData.append('price', file.price);
      formData.append('saleType', 'rights');

      const response = await axios.post(
        'https://api.intelectpravo.ru/sale/preview',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200) {
        setContractUrl(response.data.contractUrl);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Ошибка при создании предпросмотра договора');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForConfirmation = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!validateForm()) return;
      const response = await axios.post(
        'https://api.intelectpravo.ru/profile/verify-action',
        { phoneNumber: phone },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setGetCode(true);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (contractUrl) {
      window.open(contractUrl, '_blank');
    }
  };

  return loading ? (
    <div className="flex flex-col mx-auto gap-5 px-10 py-5 border-2 rounded-2xl max-w-[600px] w-full">
      <Loader />
    </div>
  ) : showPreview ? (
    <div className="flex flex-col mx-auto gap-5 px-10 py-5 border-2 rounded-2xl max-w-[600px] w-full">
      <h3 className="font-semibold text-xl">Предпросмотр договора</h3>

      <div className="flex flex-col gap-4">
        <div className="border p-4 rounded-lg">
          <h4 className="font-medium mb-2">Данные предложения:</h4>
          <p>Название: {file.title}</p>
          <p>Описание: {file.description}</p>
          <p>Цена: {file.price}</p>
        </div>

        <div className="flex flex-col gap-2">
          <a
            href={contractUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Открыть договор
          </a>

          <button
            onClick={handlePrint}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Распечатать договор
          </button>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSubmitForConfirmation}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Подтвердить и подписать
          </button>

          <button
            onClick={() => setShowPreview(false)}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Вернуться к редактированию
          </button>
        </div>
      </div>
    </div>
  ) : (
    <form
      onSubmit={getCode ? handleSubmit : handlePreview}
      className="flex flex-col mx-auto gap-5 px-10 py-5 border-2 rounded-2xl max-w-[400px] w-full"
    >
      <h3 className="font-semibold text-xl">
        Формирование предложения о продаже прав на произведение
      </h3>

      <Input
        label="Название произведения"
        type="text"
        name="title"
        value={file.title || ''}
        onChange={HandleInput}
        required
        readOnly={getCode}
      />
      {errors.title && <span className="text-red-500">{errors.title}</span>}

      <Input
        label="Описание произведения"
        type="text"
        name="description"
        value={file.description || ''}
        onChange={HandleInput}
        required
        readOnly={getCode}
      />
      {errors.description && (
        <span className="text-red-500">{errors.description}</span>
      )}

      <Input
        label="Цена произведения"
        type="text"
        name="price"
        value={file.price || ''}
        onChange={HandleInput}
        required
        readOnly={getCode}
      />
      {errors.price && <span className="text-red-500">{errors.price}</span>}

      <Input
        label="Электронный документ с произведением"
        type="file"
        name="file"
        onChange={handleFileChange}
        required
        disabled={getCode}
      />
      {errors.file && <span className="text-red-500">{errors.file}</span>}

      {getCode && (
        <Input
          label="Код подтверждения"
          type="text"
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
      )}

      <button
        type="submit"
        className={`py-2 px-4 rounded-xl ${
          !loading ? 'bg-blue-600' : 'bg-gray-400'
        } text-white`}
        disabled={loading}
      >
        {getCode ? 'Подписать договор' : 'Предпросмотр договора'}
      </button>

      <Link
        to="/"
        className="bg-gray-300 text-gray-600 rounded-xl text-white p-2 transition hover:scale-105 hover:text-gray-600"
      >
        Вернуться в личный кабинет
      </Link>

      {message && <p className="text-green-500">{message}</p>}
    </form>
  );
};

export default Sell;
