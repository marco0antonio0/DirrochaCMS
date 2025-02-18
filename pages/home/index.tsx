import Image from "next/image";
import localFont from "next/font/local";
import React, { MouseEventHandler, useCallback, useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import axios from "axios";
import { logout } from "@/services/logout";
import debounce from "lodash.debounce";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tab, Tabs, useDisclosure } from "@heroui/react";
import { endpointService } from "@/services/endpointService";
import { User } from "@/services/user/user";
import toast from "react-hot-toast";

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
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [filteredData, setFilteredData] = useState<any>([]);
  const [isEmptyData, setIsEmptyData] = useState(false);
  const [selected, setSelected] = React.useState<string>("Endpoint");
  const [authSettings, setAuthSettings] = useState<{ loginEnabled: boolean; registerEnabled: boolean }>({
    loginEnabled: false,
    registerEnabled: false,
  });

  const r = useRouter();

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
        logout()
      }
    });
    async function fetchAuthSettings() {
      const settings = await User.getAuthVisibility();
      setAuthSettings(settings);
    }

    fetchAuthSettings();
  },[])

  useEffect(() => {
    setLoading(true);
    if(selected==="Endpoint"){
      endpointService.listEndpoints().then((response: any) => {
        if (response.data.length === 0) {
          setIsEmptyData(true);
        } else {
          setData(response.data);
          setFilteredData(response.data);
          setIsEmptyData(false);
        }
        setLoading(false);
      }).catch(() => {
        setIsEmptyData(true);
        setLoading(false);
      });
    }
    if(selected==="Users"){
      User.listUsers().then((response: any) => {
        if (response.data.length === 0) {
          setIsEmptyData(true);
        } else {
          setData(response.data);
          setFilteredData(response.data);
          setIsEmptyData(false);
        }
        setLoading(false);
      }).catch(() => {
        setIsEmptyData(true);
        setLoading(false);
      });
    }

  }, []);
  const handleSearch = useCallback(
    debounce((value: string) => {
      if (!value) {
        setFilteredData(data);
        return;
      }
      
      const filtered = data.filter((item: any) =>
        (selected==="Endpoint"?item.title:item.email).toLowerCase().includes(value.toLowerCase())
      );
      setFilteredData(filtered);
    }, 300), // 300ms de debounce para evitar execuções excessivas
    [data]
  );

  function handleUserDelete(email: string) {
    setData((prev:any) => prev.filter((user: any) => user.email !== email));
    setFilteredData((prev:any) => prev.filter((user: any) => user.email !== email));
  }

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} grid grid-rows-[20px_1fr_20px] items-center w-[100%] justify-items-center min-h-screen p-8 pb-20 gap-16 sm:py-10 sm:px-3 font-[family-name:var(--font-geist-sans)]`}
    >
      <Head>
      <title>Home - Listagem de EndPoint Page</title>
      <meta name="description" content="Plataforma de gerenciamento de conteúdos e endpoints" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-[100%]">
        <div className="flex flex-col m-auto w-[100%] max-w-[700px] h-auto bg-[#F9FAFC] shadow-lg rounded-2xl md:max-w-[100%] ">
          <div className="relative m-auto mt-0 bg-[#FFFFFF] w-[100%] h-[40%] rounded-t-2xl shadow-sm flex flex-col sm:h-[30%] py-8">
            <button className="absolute left-10 top-10 md:top-6 p-2 rounded-full hover:bg-gray-200 transition" onClick={() => {logout()}}>
              <svg xmlns="http://www.w3.org/2000/svg" height="70px" viewBox="0 -960 960 960" width="30px" fill="red">
              <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/></svg>
            </button>
            {/* Título e descrição */}
            <h1 className="m-auto mb-0 text-3xl font-semibold sm:text-2xl">DIRROCHA CMS</h1>
            <span className="m-auto mt-3 text-lg opacity-65 sm:text-sm sm:mt-0 text-center px-20">Visualize, acesse e crie novos endpoints com facilidade. Clique em um para gerenciar ou adicione um novo.</span>
          </div>
          <div className="flex flex-col h-[100%] w-[100%] mt-5 px-20 lg:px-10">
          <Tabs 
            key={'lg'}
            aria-label="Tabs sizes"
            size={'lg'}
            className="m-auto"
            selectedKey={selected}
            onSelectionChange={async (key) => {
              setLoading(true);
              
              let response:any;
              if (key === "Users") {
                response = await User.listUsers();
              } else if (key === "Endpoint"){
                response = (await endpointService.listEndpoints()).data;
              }

              const newData = response ?? [];
              
              setData(newData);
              setFilteredData(newData);
              setIsEmptyData(newData.length === 0);
              setSelected(String(key));

              setLoading(false);
            }}
            disabledKeys={!authSettings.loginEnabled && !authSettings.registerEnabled ? ["Users"] : []}
          >
            <Tab key="Endpoint" title="Endpoint" />
            <Tab key="Users" title="Users" />
          </Tabs>
            <div className="h-5"></div>
            <h1 className="m-auto mt-0 mb-1 ml-0 opacity-65 sm:text-sm">Pesquisa</h1>
            <input name="search" type="text" className={`m-auto mt-1 mb-0 w-[100%] h-14 rounded-lg border-gray-200 border-2 px-5 sm:h-12`} placeholder={selected==="Endpoint"?"digite o nome":"digite o email"} 
             onChange={(e) => handleSearch(e.target.value)}/>
            <div className="h-5"></div>
            {selected==="Endpoint"?(<>
            <h1 className="m-auto mt-0 mb-1 ml-0 opacity-65 sm:text-sm">EndPoints</h1>
            {loading ? (
              <span className="loader border-8 border-black border-t-transparent rounded-full w-12 h-12 animate-spin m-auto my-20"></span>
            ) :  isEmptyData ? (  
              <h1 className="m-auto my-10 text-center text-lg">Nenhum dado encontrado</h1>
            ) :
            <div className="w-[100%] flex flex-col h-auto gap-3">
                {filteredData.map((e:any,i:any)=>(<div key={i}><Item text={e.title} onClick={()=>{r.push("/home/"+e.router)}}/></div>))}
            </div>}
            </>):(<>
            <h1 className="m-auto mt-0 mb-1 ml-0 opacity-65 sm:text-sm">Usuarios cadastrados</h1>
              {loading ? (
              <span className="loader border-8 border-black border-t-transparent rounded-full w-12 h-12 animate-spin m-auto my-20"></span>
            ) :  isEmptyData ? (  
              <h1 className="m-auto my-10 text-center text-lg">Nenhum dado encontrado</h1>
            ) :null}
            <div className="w-[100%] flex flex-col h-auto gap-3">
            {Array.isArray(filteredData) && filteredData.map((e:any,i:number) => (
              <div key={i}><ItemUser name={e.name} email={e.email} onDelete={handleUserDelete}/></div>
            ))}
            </div>
              
            </>)}
            <div className="h-5"></div>
            <Button color="primary" variant="ghost" className="h-16" isLoading={false} onClick={()=>{r.push("/create")}}>
            Configurações
            </Button>
            
            <div className="h-5"></div>
            <div className="h-1"></div>
            <span className="m-auto"></span>
            </div>
        </div>
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


function ItemUser({ name = "", email = "", onDelete }: { name: string; email: string; onDelete: (email: string) => void }) {
  const [loading, setLoading] = useState(false);
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  async function handleDelete() {
    setLoading(true);
    toast("Deletando conta ...", { duration: 4000 });

    let response = await User.deleteUser(email);
    console.log(response);
    if (response.success) {
      setTimeout(() => {
        toast.success("Conta deletada com sucesso", { duration: 4000 });
        setLoading(false);
        onDelete(email);
      }, 1000);
    } else {
      setLoading(false);
      toast.error("Falha ao deletar a conta ...", { duration: 4000 });
    }
  }

  return (
    <>
      <div className="m-auto mt-0 bg-white flex flex-row mb-0 w-[100%] min-h-44 rounded-lg border-gray-200 border-2 px-5 py-7 sm:h-12 shadow-sm">
        {!loading ? (
          <>
            <div className="w-[200px] m-auto gap-2">
              <h1 className="m-auto opacity-65">Credenciais</h1>
              <h1 className="m-auto">Nome: {name ?? "Lorem ipsum dollor"}</h1>
              <h1 className="m-auto">Email: {email ?? "Lorem ipsum dollor"}</h1>
              <h1 className="m-auto">Senha: {"criptografado"}</h1>
            </div>
          
        <div className="m-auto mr-0 ml-0 cursor-pointer" onClick={onOpen}>
          <svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="30px" fill="#FF6060">
            <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
          </svg>
        </div>
        </>
        ) : (
          <>
          <span className="loader border-4 border-black border-t-transparent rounded-full w-6 h-6 animate-spin m-auto mr-5"></span>
          <h1 className="m-auto ml-0">Deletando ...</h1>
          </>
        )}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement={"center"}>
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader className="flex flex-col gap-1">Confirme sua ação</ModalHeader>
                    <ModalBody>
                      <p>
                      Você está prestes a excluir este(s) dado(s). Essa ação é irreversível e não poderá ser desfeita. Tem certeza de que deseja continuar?
                      </p>
                    </ModalBody>
                    <ModalFooter>
                      <Button color="primary" variant="light" onPress={onClose}>
                        Cancelar
                      </Button>
                      <Button color="danger" onPress={()=>{
                        onClose()
                        handleDelete()
                      }}>
                        Excluir
                      </Button>
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
            </Modal>
      </div>
    </>
  );
}
