import Pdfs from "./Pdfs";
const AcceptAll = ({ name }) => {
  return (
    <>
      <div className="flex flex-row gap-2">
        <input type="checkbox" name={name} id={name} required />
        <label htmlFor={name}>Согласен</label>
      </div>

      <div className="flex flex-col gap-2">
        <Pdfs />
      </div>
    </>
  );
};

export default AcceptAll;
