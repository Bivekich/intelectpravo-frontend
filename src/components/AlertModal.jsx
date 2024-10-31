import React from "react";

const AlertModal = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-gray-600 p-6 rounded-lg shadow-lg w-80 max-w-full">
        <h2 className="text-lg font-semibold mb-2 text-center">{title}</h2>
        <p className="text-sm mb-4 text-center">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Да
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
          >
            Нет
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
