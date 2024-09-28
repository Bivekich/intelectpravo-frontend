const Pdfs = () => {
  const pdfs = [
    "Правила формирования и использования простой эл. подписи",
    "Политика обработки персональных данных пользователей",
    "Согласие соискателя лицензии на обработку пер. данных",
    "Политика конфиденциальности данных сторон",
    "Соглашение сторон об использовании простой эл. подписи",
  ];

  return (
    <>
      {pdfs.map((item, index) => (
        <>
          <a
            key={index}
            href={`/pdfs/${item}.pdf`}
            target="_blank"
            className="text-start"
            rel="noopener noreferrer"
          >
            {item}
          </a>
        </>
      ))}
    </>
  );
};

export default Pdfs;
