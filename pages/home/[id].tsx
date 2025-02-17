import Image from "next/image";
import localFont from "next/font/local";
import { MouseEventHandler, useCallback, useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {  generateDynamicObject } from "@/utils/generateDynamicObject";
import { toKeyValueList } from "@/utils/toKeyValueList";
import formatDataToDynamicObject from "@/utils/formatDataToDynamicObject";
import { redirect } from "next/dist/server/api-utils";
import { redirectRouter } from "@/services/redirectRouter";
import axios from "axios";
import Cookies from "js-cookie";
import { logout } from "@/services/logout";
import toast from "react-hot-toast";
import debounce from "lodash.debounce";
import { optimizeImage } from "@/services/optimizeImage";
import { Button } from "@heroui/react";
import { endpointService } from "@/services/endpointService";
import { itemService } from "@/services/itemService";

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
  const [itemSelected, setItemSelected] = useState<any>();
  const r = useRouter()
  const [forceUpdate,setForceUpdate] = useState(0)
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [filteredData, setFilteredData] = useState<any[]>([]); // Estado para armazenar dados filtrados
  const [openModal,setOpenModal] = useState(false)
  const triggerUpdate = () => {
    setForceUpdate(prev => prev + 1);
  };
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
  useEffect(()=>{
    checkAuth().then((isAuthenticated) => {
      if (!isAuthenticated) {
        logout()
      }
    });
  },[])
  const fetchEndPoint = async () => {
    if (r.query.id) {
      try {
        const fetch: any = await endpointService.listEndpoints();
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
        const fetch: any = await itemService.getItems(id_endpoint);
  
        if (fetch.data && fetch.data.length > 0) {
          setdataItem(fetch['data']);
          setFilteredData(fetch['data']);
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
    // setDate("")
    var result = dataItem.filter((e:any)=>e.id == value)
    setItemSelected(formatDataToDynamicObject(result[0]))
    console.log(result)
    if(result[0]['formattedData']['date']){
      setDate(result[0]['formattedData']['date'])
    }
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
            endpointService.listEndpoints().then((e:any)=>{
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
    
    if(errorDate.length>0) return ; 

    if (!tituloIdentificador || tituloIdentificador.trim() === "") {
        setErrors((prev) => ({
            ...prev,
            titulo_identificador: "O campo 'Título Identificador' não pode ser vazio.",
        }));
        // console.log(errors)
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
    const toastId = toast.loading("Criando item ...",{duration:4000});
    const result = await itemService.createItem(dataLocal[0]['id'],dataValue["data"])
      await refreshData(result)
      toast.success("Item criado com sucesso",{duration:4000});
      toast.dismiss(toastId)
    }else{
    const toastId = toast.loading("Atualizando item ...",{duration:4000});
    toast.success("Item atualizado com sucesso",{duration:4000});
      const result = await itemService.updateItem(dataValue["id"],dataValue["data"])
      await refreshData(result)
      toast.dismiss(toastId)
    
  }
}

const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (file) {
    try {
      const optimizedBase64 = await optimizeImage(file);
      setImage(optimizedBase64);

      if (itemSelected) {
        const updatedData = [...itemSelected];
        updatedData[0].data.forEach((ee: any, i: number) => {
          if (ee.type === "img") {
            updatedData[0].data[i].value = optimizedBase64;
          }
        });
        setItemSelected(updatedData);
      }
    } catch (error) {
      console.error("Erro ao processar a imagem:", error);
    }
  }
};

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const optimizedBase64 = await optimizeImage(file);
        setImage(optimizedBase64);
  
        if (itemSelected) {
          const updatedData = [...itemSelected];
          updatedData[0].data.forEach((ee: any, i: number) => {
            if (ee.type === "img") {
              updatedData[0].data[i].value = optimizedBase64;
            }
          });
          setItemSelected(updatedData);
        }
      } catch (error) {
        console.error("Erro ao processar a imagem:", error);
      }
    }
  };
 
  function createDados(){
    var dataLocal = data.filter((e:any)=>e.title == r.query.id) 
    var objFormated = generateDynamicObject(dataLocal[0]['campos'])
    setItemSelected([objFormated])
  }

 async function deleteItemBy_Id(id:any) {
    setLoading(true)
    const result = await itemService.deleteItem(id)
    if(dataItem.length == 1 || dataItem.length == 0){
      setdataItem([])
     }
    await refreshData(result)
  }

  async function deleteEndpoint() {
    setLoading(true)
    const fetch: any = await endpointService.listEndpoints();
    const objFormated = fetch.data.filter((e: any) => e.title === r.query.id);
    const result = await endpointService.deleteEndpoint(objFormated[0]['id'])
    dataItem.map((e)=>{
      itemService.deleteItem(e.endpointId)
    })
    await refreshData(result)
    r.push("/home")

   }

   const [url, setUrl] = useState("");

   useEffect(() => {
     if (typeof window !== "undefined") {
       const hostname = window.location.hostname;
       let protocol = "https://";
       let port = "";
   
       // Define o protocolo correto
       if (hostname === "0.0.0.0" || hostname === "localhost") {
         protocol = "http://";
         port = ":3000"; // Defina a porta desejada
       }
   
       const fullUrl = `${protocol}${hostname}${port}/api/${r.query.id}`;
       setUrl(fullUrl);
     }
   }, [r.asPath]);
   
 

   const [date, setDate] = useState("");
   const [errorDate, setErrorDate] = useState("");
 
   const formatDateToDDMMYYYY = (input: string) => {
     if (input.includes("-")) {
       const [year, month, day] = input.split("-");
       return `${day}/${month}/${year}`;
     }
     return input;
   };
 
   const validateDate = (input: string) => {
     console.log("Validando:", input);
     const dateRegex = /^(?:19|20)\d\d-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/
;
     if (!dateRegex.test(input)) {
       setErrorDate("Data inválida! Use o formato dd/mm/yyyy");
       return true
     } else {
       setErrorDate("");
       return false
     }
     return true
    };
 
   const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const rawValue = e.target.value;
     const formattedValue = formatDateToDDMMYYYY(rawValue);
     setDate(formattedValue);
     validateDate(formattedValue);
   };
   const handleSearch = useCallback(
    debounce((value: string) => {
      if (!value.trim()) {
        setFilteredData(dataItem); // Restaura todos os itens caso o campo esteja vazio
        return;
      }
  
      const filtered = dataItem.filter((item: any) =>
        item?.formattedData?.titulo_identificador?.toLowerCase().includes(value.toLowerCase())
      );
  
      setFilteredData(filtered);
    }, 300), // Debounce de 300ms para evitar execuções excessivas
    [dataItem] // Atualiza a função sempre que dataItem mudar
  );
  useEffect(() => {
    setFilteredData(dataItem); // Garante que filteredData inicie com todos os itens
  }, [dataItem]); // Atualiza sempre que dataItem mudar
  return (
    
    <div
      className={`${geistSans.variable} ${geistMono.variable} grid grid-rows-[20px_1fr_20px] items-center w-[100%] justify-items-center min-h-screen p-8 pb-20 gap-16 sm:py-10 sm:px-3 font-[family-name:var(--font-geist-sans)]`}
    >


      <Head>
        <title>Gerenciamento de Itens | Plataforma</title>
        <meta name="description" content="Plataforma de gerenciamento de conteúdos e endpoints" />
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
          <span className="m-auto mt-3 text-lg opacity-65 sm:text-sm sm:mt-0 text-center px-16">Você está prestes a excluir este(s) dado(s). Essa ação é irreversível e não poderá ser desfeita. Tem certeza de que deseja continuar?</span>
        </div>

        <div className="flex flex-col h-[100%] w-[100%] mt-5 px-20 lg:px-10">
        {loadingData?<>  
          <div className="h-5"></div>
          
          <h1 className="m-auto mt-0 mb-1 ml-0 opacity-65 sm:text-sm">Confirme sua ação <br /> Voce deseja deletar o {itemSelected?"dados da api de titulo "+itemSelected[0]['data'][0]["value"]:"endpoint"}?</h1>
          <div className="w-[100%] flex flex-col h-auto gap-3" key={forceUpdate}>
            
          </div>
          <div className="h-5"></div>
          <div className="w-[100%] flex flex-row gap-3">

          <Button color="danger" className="align-middle w-[100%] h-14 mt-0 flex justify-center items-center" onClick={async()=> {
              checkAuth().then((isAuthenticated) => {
                if (!isAuthenticated) {
                  logout()
                }else{
                  itemSelected?deleteItemBy_Id(itemSelected[0]["id"]):  deleteEndpoint()
                }
              });
          }}>
              {loading ? <span className="loader border-4 border-black border-t-transparent rounded-full w-6 h-6 animate-spin"></span> : "Sim"}
          </Button>
          <Button color="success" className="align-middle w-[100%] h-14 mt-0 flex justify-center items-center text-white" onClick={()=>{
            setOpenModal(false)}}>
              {loading ? <span className="loader border-4 border-black border-t-transparent rounded-full w-6 h-6 animate-spin"></span> : "Não"}
          </Button>
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
            <span className="m-auto mt-3 text-lg opacity-65 sm:text-sm sm:mt-0 text-center px-16">
              Gerencie suas informações de forma simples. Consulte os dados existentes ou adicione novos rapidamente. 🚀 <br />
              <a href={url} target="_blank" rel="noopener noreferrer">{url}</a> </span>
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
            <h1 className="m-auto mt-0 mb-1 ml-0 opacity-65 sm:text-sm">Pesquisa</h1>
            <input name="search" type="text" className={`m-auto mt-1 mb-0 w-[100%] h-14 rounded-lg border-gray-200 border-2 px-5 sm:h-12`} placeholder="digite" 
             onChange={(e) => handleSearch(e.target.value)}/>
            <div className="h-5"></div>
            <h1 className="m-auto mt-0 mb-1 ml-0 opacity-65 sm:text-sm">Listagem</h1>
            {isEmpytdata && filteredData.length==0?(<>
              <h1 className="m-auto my-10">Nenhum dado encontrado</h1>
            </>):null}
            <div className="w-[100%] flex flex-col h-auto gap-3" key={forceUpdate}>
              {filteredData.map((e,i)=>{
              return  (<div key={i}><Item text={e['formattedData'].titulo_identificador} 
                onClick={()=>{goToItem(e.id)}}/></div>)
               
              })}
            </div>

            
            <div className="h-5"></div>
            <Button color="primary" variant="ghost" className="h-16" isLoading={loading} onClick={()=>{createDados()}}>
            Adiciona dados
            </Button>
            </>:<span className="loader border-8 border-black border-t-transparent rounded-full w-12 h-12 animate-spin m-auto my-20"></span>}
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
              setErrorDate("")
              setDate("")
              }}>
              <svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="30px" fill="black">
                <path d="M400-240 160-480l240-240 56 58-142 142h486v80H314l142 142-56 58Z"/>
              </svg>
            </button>
            {/* Título e descrição */}
            <h1 className="m-auto mb-0 text-3xl font-semibold sm:text-2xl">DIRROCHA CMS</h1>
            <span className="m-auto mt-3 text-lg text-center opacity-65 sm:text-sm sm:mt-0">{itemSelected[0]['id'] != null ? 
            "Atualize os dados deste item de forma rápida e fácil." : "Crie um novo registro para este item com apenas alguns cliques."}
            {itemSelected[0]['id'] != null ?<>
            <br />
            <a href={url+"?t="+itemSelected[0]['data'][0]["value"]} target="_blank" rel="noopener noreferrer">{url+"?t="+itemSelected[0]['data'][0]["value"]}</a> 
            </>:null}
            </span>
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
            e.type==="img"?
              <>
              <ImageUpload file={handleFileChange} handleDrop={handleDrop} image={image}/>
              </>: 
              <>
              <div className="m-auto mt-0 mb-0 w-[100%]">
              <input
                type="date"
                className="h-14 w-full rounded-lg border-2 border-gray-200 px-5 sm:h-12"
                value={e.value??""}
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
              </>
               }
            </div>)):null}
            
            <div className="h-5"></div>
            {errors.titulo_identificador && <span className="text-red-500 text-sm m-auto mt-1">Campo titulo identificador não pode ser vazio</span>}
            <div className="h-5"></div>
            <Button color="primary" variant="solid" className="h-14" isLoading={loading} onClick={()=>{saveData()}}>
            Salvar dados
            </Button>
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

