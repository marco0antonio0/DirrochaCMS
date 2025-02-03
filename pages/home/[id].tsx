import Image from "next/image";
import localFont from "next/font/local";
import { MouseEventHandler, useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { getEndpoints } from "@/services/getEndpoints";
import {  generateDynamicObject } from "@/utils/generateDynamicObject";
import { createItemForEndpoint } from "@/services/createItemToEndpoint";
import { getItemsByEndpoint } from "@/services/getItensToEndpoints";
import { toKeyValueList } from "@/utils/toKeyValueList";
import formatDataToDynamicObject from "@/utils/formatDataToDynamicObject";
import { deleteItemById } from "@/services/deleteItemById";
import { deleteEndpointIdById } from "@/services/deleteEndpointById";
import { redirect } from "next/dist/server/api-utils";
import { redirectRouter } from "@/services/redirectRouter";
import { updateItemForEndpoint } from "@/services/updateItemToEndpoint";
import axios from "axios";
import Cookies from "js-cookie";

const geistSans = localFont({
  src: "./../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [isEmpytdata, setIsEmpytdata] = useState(false);
  const [loadingDataItem, setLoadingDataItem] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data,setdata] = useState([])
  const [dataItem,setdataItem] = useState<any[]>([])
  const [itens, setItens] = useState<any[]>([]);
  const [itemSelected, setItemSelected] = useState<any>();
  const r = useRouter()
  const [forceUpdate,setForceUpdate] = useState(0)
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [openModal,setOpenModal] = useState(false)
  const triggerUpdate = () => {
    setForceUpdate(prev => prev + 1);
  };

  useEffect(()=>{
    async function checkAuth() {
      const token = Cookies.get("token");
    
      if (!token) {
        // console.log("Nenhum token encontrado, redirecionando...");
        return false;
      }
    
      try {
        const response = await axios.get("/api/verifyToken", {
          headers: {
            Authorization: `Bearer ${token}`, // Enviando o token como Bearer
          },
        });
    
        // console.log("Token válido:", response.data);
        return true;
      } catch (error) {
        // console.error("Erro na autenticação:", error.response?.data);
        return false;
      }
    }
    checkAuth().then((isAuthenticated) => {
      if (!isAuthenticated) {
        window.location.href = "/"; // Redireciona para login se token for inválido
      }
    });
  },[])
  const fetchEndPoint = async () => {
    if (r.query.id) {
      try {
        const fetch: any = await getEndpoints();
        const objFormated = fetch.data.filter((e: any) => e.title === r.query.id);
        if (objFormated.length > 0) {
          setdata(objFormated);
          setLoadingData(true);
        }
      } catch (error) {
        console.error("Erro ao buscar endpoints:", error);
      }
    }
  };
  
  const fetchEndItemPoint = async () => {
    if (r.query.id && data.length > 0) {
      try {
        const id_endpoint = data[0]['id'];
        const fetch: any = await getItemsByEndpoint(id_endpoint);
  
        if (fetch.data && fetch.data.length > 0) {
          setdataItem(fetch['data']);
          setLoadingData(true);
          triggerUpdate();
        }else{
          setIsEmpytdata(true)
        }
      } catch (error) {
        console.error("Erro ao buscar itens do endpoint:", error);
      }
    }
  };
  
  useEffect(() => {
    if(r.query.id){
      redirectRouter(r);
    }
  }, [r.query.id]);

  // Separando os efeitos para garantir a ordem correta
  useEffect(() => {
    fetchEndPoint();
  }, [r.query.id]);
  
  useEffect(() => {
    if (loadingData) {
      fetchEndItemPoint();
    }
  }, [loadingData]);
  




  function goToItem(value:any){
    var result = dataItem.filter((e:any)=>e.id == value)
    setItemSelected(formatDataToDynamicObject(result[0]))
    // setImage(result[0])
    if(result[0]['formattedData']['image']){
      setImage(result[0]['formattedData']['image'])
    }
  }

  async function refreshData(result:any){
    if (result.success) {
      setTimeout(() => {
        setLoading(false);

        if(!loadingData){
          if(r.query.id){
            getEndpoints().then((e:any)=>{
              var objFormated = e.data.filter((e:any)=>e.title === r.query.id)
              setdata(objFormated)
            })
          }
        }

      }, 1000);
      await fetchEndItemPoint()
      setItemSelected(null)
      setImage(null)
      setLoadingData(true)
      setOpenModal(false)
    } else {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }

  async function saveData (){
    const tituloIdentificador = itemSelected[0]?.data.find((e:any) => e.title === "titulo_identificador")?.value;

    if (!tituloIdentificador || tituloIdentificador.trim() === "") {
        setErrors((prev) => ({
            ...prev,
            titulo_identificador: "O campo 'Título Identificador' não pode ser vazio.",
        }));
        console.log(errors)
        return;
    }else{
      setErrors((prev) => ({
        ...prev,
        titulo_identificador: "",
    }));
    }
    setLoading(true);
    var dataValue = itemSelected[0]
    var dataLocal = data.filter((e:any)=>e.title == r.query.id) 
    if(!dataValue["id"]){
      const result = await createItemForEndpoint(dataLocal[0]['id'],dataValue["data"])
      await refreshData(result)
  }else{
      const result = await updateItemForEndpoint(dataValue["id"],dataValue["data"])
      await refreshData(result)
    
  }
}

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        itemSelected[0]['data'].map((ee:any,i:any)=>{
          if(ee['type'] == 'img'){
            itemSelected[0]['data'][i]['value'] = e.target?.result as string
          }
        })
      };
      reader.readAsDataURL(file);
      
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        itemSelected[0]['data'].map((ee:any,i:any)=>{
          if(ee['type'] == 'img'){
            itemSelected[0]['data'][i]['value'] = e.target?.result as string
          }
        })
      };
      reader.readAsDataURL(file);
    }
  };
 
  function createDados(){
    var dataLocal = data.filter((e:any)=>e.title == r.query.id) 
    var objFormated = generateDynamicObject(dataLocal[0]['campos'])
    setItemSelected([objFormated])
  }

 async function deleteItemBy_Id(id:any) {
    setLoading(true)
    const result = await deleteItemById(id)
    if(dataItem.length == 1 || dataItem.length == 0){
      setdataItem([])
     }
    await refreshData(result)
  }

  async function deleteEndpoint() {
    setLoading(true)
    const fetch: any = await getEndpoints();
    const objFormated = fetch.data.filter((e: any) => e.title === r.query.id);
    const result = await deleteEndpointIdById(objFormated[0]['id'])
    dataItem.map((e)=>{
     deleteItemById(e.endpointId)
    })
    await refreshData(result)
    r.push("/home")

   }

  return (
    
    <div
      className={`${geistSans.variable} ${geistMono.variable} grid grid-rows-[20px_1fr_20px] items-center w-[100%] justify-items-center min-h-screen p-8 pb-20 gap-16 sm:py-10 sm:px-3 font-[family-name:var(--font-geist-sans)]`}
    >
      <Head>
      <title>Criar Item EndPoint Page</title>
      <meta name="description" content="Dirrocha CMS" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-[100%] h-auto">
        {openModal?
        // ====================================================================================================================================
        //                                              ModalConfirm
        // ====================================================================================================================================
        <div className="flex flex-col m-auto w-[100%] max-w-[700px] h-auto bg-[#F9FAFC] shadow-lg rounded-2xl md:max-w-[100%]">
        <div className="relative m-auto mt-0 bg-[#FFFFFF] w-[100%] h-[40%] rounded-t-2xl shadow-sm flex flex-col sm:h-[30%] py-8">
          {/* Botão de voltar no canto superior esquerdo */}
          <button className="absolute left-6 top-10 md:top-6 p-2 rounded-full hover:bg-gray-200 transition" onClick={() => setOpenModal(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="30px" fill="black">
              <path d="M400-240 160-480l240-240 56 58-142 142h486v80H314l142 142-56 58Z"/>
            </svg>
          </button>
          {/* Título e descrição */}
          <h1 className="m-auto mb-0 text-3xl font-semibold sm:text-2xl">DIRROCHA CMS</h1>
          <span className="m-auto mt-3 text-lg opacity-65 sm:text-sm sm:mt-0 text-center px-16">Voce esta prestes a deletar este estes dado(s), essa ação e irreversivel, deseja continuar mesmo assim ?</span>
        </div>

        <div className="flex flex-col h-[100%] w-[100%] mt-5 px-20 lg:px-10">
        {loadingData?<>  
          <div className="h-5"></div>
          
          <h1 className="m-auto mt-0 mb-1 ml-0 opacity-65 sm:text-sm">Confirme sua ação <br /> Voce deseja deletar o {itemSelected?"dados da api de titulo "+itemSelected[0]['data']['titulo_identificador']:"endpoint"}?</h1>
          <div className="w-[100%] flex flex-col h-auto gap-3" key={forceUpdate}>
            
          </div>
          <div className="h-5"></div>
          <div className="w-[100%] flex flex-row gap-3">
          <button className="align-middle w-[100%] h-14 border-2 border-gray-200 rounded-md mt-0 flex justify-center items-center bg-red-400 text-white" onClick={()=>{
          itemSelected?deleteItemBy_Id(itemSelected[0]["id"]):  deleteEndpoint()}}>
              {loading ? <span className="loader border-4 border-black border-t-transparent rounded-full w-6 h-6 animate-spin"></span> : "Sim"}
          </button>
          <button className="align-middle w-[100%] h-14 border-2 border-gray-200 rounded-md mt-0 flex justify-center items-center bg-green-500 text-white" onClick={()=>{
            setOpenModal(false)}}>
              {loading ? <span className="loader border-4 border-black border-t-transparent rounded-full w-6 h-6 animate-spin"></span> : "Não"}
          </button>
          </div>

          </>:<span className="loader border-8 border-black border-t-transparent rounded-full w-12 h-12 animate-spin m-auto my-20"></span>}
          <div className="h-5"></div>
          <div className="h-1"></div>
          <span className="m-auto"></span>
          </div>
      </div>   
        // ====================================================================================================================================
        // ====================================================================================================================================
        :!itemSelected?
        // ====================================================================================================================================
        //                                                  Lista de itens
        // ====================================================================================================================================
        <div className="flex flex-col m-auto w-[100%] max-w-[700px] h-auto bg-[#F9FAFC] shadow-lg rounded-2xl md:max-w-[100%]">
          <div className="relative m-auto mt-0 bg-[#FFFFFF] w-[100%] h-[40%] rounded-t-2xl shadow-sm flex flex-col sm:h-[30%] py-8">
            {/* Botão de voltar no canto superior esquerdo */}
            <button className="absolute left-6 top-10 md:top-6 p-2 rounded-full hover:bg-gray-200 transition" onClick={() => window.history.back()}>
              <svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="30px" fill="black">
                <path d="M400-240 160-480l240-240 56 58-142 142h486v80H314l142 142-56 58Z"/>
              </svg>
            </button>
            {/* Título e descrição */}
            <h1 className="m-auto mb-0 text-3xl font-semibold sm:text-2xl">DIRROCHA CMS</h1>
            <span className="m-auto mt-3 text-lg opacity-65 sm:text-sm sm:mt-0">Pagina de listagem de itens</span>
            {!loadingData || loading? <span className={`absolute right-8 top-[60px] md:top-12 p-2 rounded-full hover:bg-gray-200 transition ${true?"":"hidden"} loader border-4 border-black border-t-transparent rounded-full w-6 h-6 animate-spin`}></span> :
            <button className={`right-6 top-10 md:top-6 p-2 rounded-full hover:bg-gray-200 transition ${true?"absolute":"hidden"}`} onClick={async () => {
              setOpenModal(true)
              }}>
              <svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="30px" fill="#FF6060">
              <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
            </button>}
          </div>

          <div className="flex flex-col h-[100%] w-[100%] mt-5 px-20 lg:px-10">
          {loadingData?<>  
            <div className="h-5"></div>
            
            <h1 className="m-auto mt-0 mb-1 ml-0 opacity-65 sm:text-sm">Listagem</h1>
            {isEmpytdata && dataItem.length==0?(<>
              <h1 className="m-auto my-10">Nenhum dado encontrado</h1>
            </>):null}
            <div className="w-[100%] flex flex-col h-auto gap-3" key={forceUpdate}>
              {dataItem.map((e,i)=>{
              return  (<div key={i}><Item text={e['formattedData'].titulo_identificador} 
                onClick={()=>{goToItem(e.id)}}/></div>)
               
              })}
            </div>

            
            <div className="h-5"></div>
            <button className="align-middle w-[100%] h-14 border-2 border-gray-200 rounded-md mt-0 flex justify-center items-center" onClick={()=>{createDados()}}>
                {loading ? <span className="loader border-4 border-black border-t-transparent rounded-full w-6 h-6 animate-spin"></span> : "Adiciona dados"}
            </button></>:<span className="loader border-8 border-black border-t-transparent rounded-full w-12 h-12 animate-spin m-auto my-20"></span>}
            <div className="h-5"></div>
            <div className="h-1"></div>
            <span className="m-auto"></span>
            </div>
        </div>:
        // ====================================================================================================================================
        //                                                       Item selecionado
        // ====================================================================================================================================
        <div className="flex flex-col m-auto w-[100%] max-w-[700px] h-auto bg-[#F9FAFC] shadow-lg rounded-2xl md:max-w-[100%]">
          <div className="relative m-auto mt-0 bg-[#FFFFFF] w-[100%] h-[40%] rounded-t-2xl shadow-sm flex flex-col sm:h-[30%] py-8">
            {/* Botão de voltar no canto superior esquerdo */}
            <button className="absolute left-6 top-10 md:top-6 p-2 rounded-full hover:bg-gray-200 transition" onClick={() => {
              setItemSelected(null)
              setImage(null)
              }}>
              <svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="30px" fill="black">
                <path d="M400-240 160-480l240-240 56 58-142 142h486v80H314l142 142-56 58Z"/>
              </svg>
            </button>
            {/* Título e descrição */}
            <h1 className="m-auto mb-0 text-3xl font-semibold sm:text-2xl">DIRROCHA CMS</h1>
            <span className="m-auto mt-3 text-lg opacity-65 sm:text-sm sm:mt-0">Informações do item</span>
            {loading && itemSelected[0]['id'] ? <span className={`absolute right-8 top-[60px] md:top-12 p-2 rounded-full hover:bg-gray-200 transition ${itemSelected || !itemSelected[0]['id']?"":"hidden"} loader border-4 border-black border-t-transparent rounded-full w-6 h-6 animate-spin`}></span> :
            <button className={`right-6 top-10 md:top-6 p-2 rounded-full hover:bg-gray-200 transition ${itemSelected[0]['id']!=null?"absolute":"hidden"}`} onClick={async () => {
              setOpenModal(true)
              }}>
              <svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="30px" fill="#FF6060">
              <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
            </button>}
          </div>
          <div className="flex flex-col h-[100%] w-[100%] mt-5 px-20 lg:px-10">
            
            <div className="h-5"></div>
            
            {itemSelected?itemSelected[0]['data'].map((e:any,i:any)=>(<div key={i}>
              <h1 className="m-auto mt-3 mb-1 ml-0 opacity-65 sm:text-sm">{e.title}</h1>
              {e.type==="string"?(e.mult?
              <textarea className={`m-auto mt-0 mb-0 w-[100%] h-36 rounded-lg border-gray-200 border-2 px-5 sm:h-36 py-5`} value={e.value??""} placeholder="digite"   onChange={(event) => {
                const newValue = event.target.value;
                const updatedData = [...itemSelected];
            
                if (e.title === "titulo_identificador" && newValue.trim() === "") {
                    setErrors((prev) => ({
                        ...prev,
                        titulo_identificador: "O campo 'Título Identificador' não pode ser vazio.",
                    }));
                } else {
                    setErrors((prev) => {
                        const updatedErrors = { ...prev };
                        delete updatedErrors.titulo_identificador;
                        return updatedErrors;
                    });
                }
            
                updatedData[0].data[i].value = newValue;
                setItemSelected(updatedData);
              }}
            />
              :<input type="text" className={`m-auto mt-0 mb-0 w-[100%] h-14 rounded-lg border-gray-200 border-2 px-5 sm:h-12`} value={e.value||""}  placeholder="digite"   onChange={(event) => {
                const newValue = event.target.value;
                const updatedData = [...itemSelected];
            
                if (e.title === "titulo_identificador" && newValue.trim() === "") {
                    setErrors((prev) => ({
                        ...prev,
                        titulo_identificador: "O campo 'Título Identificador' não pode ser vazio.",
                    }));
                } else {
                    setErrors((prev) => {
                        const updatedErrors = { ...prev };
                        delete updatedErrors.titulo_identificador;
                        return updatedErrors;
                    });
                }
            
                updatedData[0].data[i].value = newValue;
                setItemSelected(updatedData);
              }}
            />):
              <>
              <ImageUpload file={handleFileChange} handleDrop={handleDrop} image={image}/>
              </>
               }
            </div>)):null}
            
            <div className="h-5"></div>
            {errors.titulo_identificador && <span className="text-red-500 text-sm m-auto mt-1">Campo titulo identificador não pode ser vazio</span>}
            <div className="h-5"></div>
            <button className="align-middle w-[100%] h-14 border-2 border-gray-200 rounded-md mt-0 flex justify-center items-center bg-blue-500 text-white" onClick={()=>{saveData()}}>
                {loading ? <span className="loader border-4 border-black border-t-transparent rounded-full w-6 h-6 animate-spin"></span> : "Salvar dados"}
            </button>
            <div className="h-5"></div>
            <div className="h-1"></div>
            <span className="m-auto"></span>
            </div>
        </div>
        }
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/marco0antonio0/loginPageExample"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Desenvolvido por @marco0antonio0
        </a>
        
      </footer>
    </div>
  );
}

function Item({text="",onClick}:{text:any,onClick: any}){
    return<>
    <div className="m-auto mt-0 bg-white flex flex-row mb-0 w-[100%] min-h-20 rounded-lg border-gray-200 border-2 px-5 sm:h-12 shadow-sm select-none cursor-pointer" onClick={()=>onClick()}>
        <h1 className="m-auto">{text??"Lorem ipsum dollor"}</h1> 
        <svg
        className="w-10 h-10 text-black opacity-65 fill-current m-auto ml-0 mr-0"
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 -960 960 960"
        width="24px"
        >
        <path d="m560-240-56-58 142-142H160v-80h486L504-662l56-58 240 240-240 240Z" />
        </svg>
    </div>
    </>
}





function ImageUpload({file,handleDrop,image}:{file:any,handleDrop:any,image:any}) {



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


