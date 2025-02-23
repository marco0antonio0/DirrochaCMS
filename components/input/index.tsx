export function InputComponent({data , multiline}:{data:FieldProps , multiline:boolean}){
  if(multiline){
    return <InputMultilineComponent data={data}/>
  }else{
    return <InputSingleComponent data={data}/>
  }
}

            
export function InputMultilineComponent({data}:{data:FieldProps}){
  const {title,value,itemSelected,setItemSelected,setErrors,i} = data
  return(<>
  <h1 className="m-auto mt-3 mb-1 ml-0 opacity-65 sm:text-sm">{title}</h1>
  <textarea className={`m-auto mt-0 mb-0 w-[100%] h-36 rounded-lg border-gray-200 border-2 px-5 sm:h-36 py-5`} value={value??""} placeholder="digite" onChange={(event) => {
                const newValue = event.target.value;
                const updatedData = [...itemSelected];
            
                if (title === "titulo_identificador" && newValue.trim() === "") {
                    setErrors((prev:any) => ({
                        ...prev,
                        titulo_identificador: "O campo 'Título Identificador' não pode ser vazio.",
                    }));
                } else {
                    setErrors((prev:any) => {
                        const updatedErrors = { ...prev };
                        delete updatedErrors.titulo_identificador;
                        return updatedErrors;
                    });
                }
            
                updatedData[0].data[i].value = newValue;
                setItemSelected(updatedData);
              }}/>
  </>)
}



export function InputSingleComponent({data}:{data:FieldProps}){
  const {title,value,itemSelected,setItemSelected,setErrors,i} = data
  return (<>
  <h1 className="m-auto mt-3 mb-1 ml-0 opacity-65 sm:text-sm">{title}</h1>
  <input type="text" className={`m-auto mt-0 mb-0 w-[100%] h-14 rounded-lg border-gray-200 border-2 px-5 sm:h-12`} value={value||""}  placeholder="digite"   onChange={(event) => {
                const newValue = event.target.value;
                const updatedData = [...itemSelected];
            
                if (title === "titulo_identificador" && newValue.trim() === "") {
                    setErrors((prev:any) => ({
                        ...prev,
                        titulo_identificador: "O campo 'Título Identificador' não pode ser vazio.",
                    }));
                } else {
                    setErrors((prev:any) => {
                        const updatedErrors = { ...prev };
                        delete updatedErrors.titulo_identificador;
                        return updatedErrors;
                    });
                }
            
                updatedData[0].data[i].value = newValue;
                setItemSelected(updatedData);
              }}
            />
  </>)
}

export function InputSingleNumberComponent({ data }: { data: FieldProps }) {
  const { title, value, itemSelected, setItemSelected, setErrors, i } = data;

  return (
    <>
      <h1 className="m-auto mt-3 mb-1 ml-0 opacity-65 sm:text-sm">{title}</h1>
      <input
        type="number"
        className="m-auto mt-0 mb-0 w-[100%] h-14 rounded-lg border-gray-200 border-2 px-5 sm:h-12"
        value={value || ""}
        placeholder="Digite"
        onChange={(event) => {
          let newValue = event.target.value;

          if (!/^[0-9,.]*$/.test(newValue)) {
            return;
          }

          const updatedData = [...itemSelected];

          if (title === "titulo_identificador" && newValue.trim() === "") {
            setErrors((prev: any) => ({
              ...prev,
              titulo_identificador: "O campo 'Título Identificador' não pode ser vazio.",
            }));
          } else {
            setErrors((prev: any) => {
              const updatedErrors = { ...prev };
              delete updatedErrors.titulo_identificador;
              return updatedErrors;
            });
          }

          updatedData[0].data[i].value = newValue;
          setItemSelected(updatedData);
        }}
      />
    </>
  );
}


export function InputDateComponent({title,value,itemSelected,setItemSelected,errorDate,validateDate,handleDateChange,setDate,date,i}:FieldPropsDate){
  return (<>
    <h1 className="m-auto mt-3 mb-1 ml-0 opacity-65 sm:text-sm">{title}</h1>
    <div className="m-auto mt-0 mb-0 w-[100%]">
    <input
      type="date"
      className="h-14 w-full rounded-lg border-2 border-gray-200 px-5 sm:h-12"
      value={value??""}
      onChange={(e) => {
        const newValue = e.target.value;
        const updatedData = [...itemSelected];
        handleDateChange
        setDate(e.target.value)
        updatedData[0].data[i].value = newValue;
        setItemSelected(updatedData);
      }}
      onBlur={() => validateDate(date)}
    />
    {errorDate && <p className="text-red-500 text-sm mt-1">{errorDate}</p>}
  </div>
  </>)
}



export function InputImageUpload({file,handleDrop,image,title}:{file:any,handleDrop:any,image:any,title:string}) {
  return (<>
  
  <h1 className="m-auto mt-3 mb-2 ml-0 opacity-65 sm:text-sm">{title}</h1>
    <div
      className="w-full mx-auto py-6 border-2 border-dashed border-gray-400 rounded-lg text-center cursor-pointer flex flex-col items-center justify-center hover:bg-gray-100 transition"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => document.getElementById("fileInput")?.click()}
    >
      {image ? (
        <img src={image} alt="Preview" className="w-40 h-40 object-cover rounded-md shadow-md" />
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="50px"
            viewBox="0 -960 960 960"
            width="50px"
            fill="gray"
          >
            <path d="M480-160q-17 0-28.5-11.5T440-200q0-17 11.5-28.5T480-240q17 0 28.5 11.5T520-200q0 17-11.5 28.5T480-160Zm0-120q-17 0-28.5-11.5T440-320v-240q0-17 11.5-28.5T480-600q17 0 28.5 11.5T520-560v240q0 17-11.5 28.5T480-280Zm0 280q-82 0-154-31.5T196-120 120-236t-31.5-154q0-82 31.5-154T196-764t123-84.5T480-880q82 0 154 31.5T764-764t84.5 123T880-480q0 82-31.5 154T764-196t-123 84.5T480 880ZM480-80q100 0 186.5-38.5t152-103 103-152T960-480q0-100-38.5-186.5t-103-152-152-103T480-960q-100 0-186.5 38.5t-152 103-103 152T0-480q0 100 38.5 186.5t103 152 152 103T480-80ZM280-400h400l-150-200-125 165-75-85-50 60Z" />
          </svg>
          <p className="mt-2 text-gray-600">Arraste e solte uma imagem aqui</p>
          <p className="text-sm text-gray-500">ou clique para selecionar</p>
        </>
      )}

      <input id="fileInput" type="file" accept="image/*" className="hidden" onChange={file} />
    </div>
  </>
  );
}



interface FieldProps {
  title: string;
  value: any;
  itemSelected: any;
  setItemSelected: (data: any) => void;
  setErrors: (errors: any) => void;
  i: number;
}

interface FieldPropsDate {
  title: string;
  value: any;
  itemSelected: any;
  setItemSelected: (data: any) => void;
  i: number;
  errorDate: any;
  validateDate: any;
  handleDateChange: any;
  setDate: any;
  date: any;
}