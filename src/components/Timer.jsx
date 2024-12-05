import React, { useState, useEffect } from "react";

const Timer = ({ cycle }) => {
  const initialTime = 10 * 60; // 1 минута в секундах
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedTime = localStorage.getItem("timer");
    return savedTime ? parseInt(savedTime, 10) : initialTime;
  });

  useEffect(() => {
    // Сброс таймера при изменении цикла
    setTimeLeft(initialTime);
    localStorage.setItem("timer", initialTime);

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          localStorage.removeItem("timer");
          return 0; // Убедитесь, что timeLeft не становится отрицательным
        }
        const updatedTime = prevTime - 1;
        localStorage.setItem("timer", updatedTime);
        return updatedTime;
      });
    }, 1000);

    return () => clearInterval(timer); // Очистка таймера при размонтировании
  }, [cycle]); // Добавляем cycle в зависимости

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="timer">
      <p>Оставшееся время: {formatTime(timeLeft)}</p>
      {timeLeft <= 0 && <p>Время истекло!</p>}
    </div>
  );
};

export default Timer;
