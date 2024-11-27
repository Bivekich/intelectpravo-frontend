import React, { useState, useEffect } from "react";

const Timer = () => {
  const initialTime = 10 * 60; // 10 минут в секундах
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedTime = localStorage.getItem("timer");
    return savedTime ? parseInt(savedTime, 10) : initialTime;
  });

  useEffect(() => {
    if (timeLeft <= 0) {
      localStorage.removeItem("timer");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        const updatedTime = prevTime - 1;
        localStorage.setItem("timer", updatedTime);
        return updatedTime;
      });
    }, 1000);

    return () => clearInterval(timer); // Очистка таймера при размонтировании
  }, [timeLeft]);

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
