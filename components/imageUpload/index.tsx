
export function ImageUpload({file,handleDrop,image}:{file:any,handleDrop:any,image:any}) {



    return (
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
    );
  }