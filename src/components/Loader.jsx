import React from "react";

const Loader = () => {
  return (
    <div className="flex flex-col gap-5 items-center justify-center h-fit w-full py-7">
      <div className="w-16 h-16 border-4 border-blue-500 border-dotted rounded-full animate-spin"></div>
      <p>Подождите, идет загрузка...</p>
    </div>
  );
};

export default Loader;
