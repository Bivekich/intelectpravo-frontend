const Pdfs = () => {
  const pdfs = [
    "Лицензионный договор-оферта на использование Платформы",
    "Политика обработки пер. данных",
    "Форма согласия на обработку пер. данных",
    "Политика конфиденциальности Платформы",
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
