import Pdfs from "./Pdfs";
const AcceptAll = ({ name }) => {
  return (
    <>
      <div className="flex flex-row gap-2">
        <input type="checkbox" name={name} id={name} required />
        <label htmlFor={name}>
          Согласен с условиями лицензионного договора- оферты на использование
          платформы, политикой обработки персональных данных, политикой
          конфиденциальности, принимаю их безоговорочно и в полном объёме. Даю
          свое согласие на обработку персональных данных
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <Pdfs />
      </div>
    </>
  );
};

export default AcceptAll;
