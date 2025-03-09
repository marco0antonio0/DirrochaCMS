import Image from "next/image";
import localFont from "next/font/local";
import React, { MouseEventHandler, useCallback, useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import axios from "axios";
import { logout } from "@/services/logout";
import debounce from "lodash.debounce";
import { Button, Chip, Code, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tab, Tabs, useDisclosure } from "@heroui/react";
import { endpointService } from "@/services/endpointService";
import { User } from "@/services/user/user";
import toast from "react-hot-toast";
import Navbar from "@/components/navbar";
import { Item } from "@/components/item";
import { ItemUser } from "@/components/itemUser";

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
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [authSettings, setAuthSettings] = useState<{ loginEnabled: boolean; registerEnabled: boolean }>({
    loginEnabled: false,
    registerEnabled: false,
  });

  const r = useRouter();

  useEffect(()=>{
    async function checkAuth() {
      const token = Cookies.get("token");
    
      if (!token) {
        return false;
      }
    
      try {
        const response = await axios.get("/api/verifyToken", {
          headers: {
            Authorization: `Bearer ${token}`, // Enviando o token como Bearer
          },
        });
        return true;
      } catch (error) {
        // console.error("Erro na autenticação:", error.response?.data);
        return false;
      }
    }
    checkAuth().then((isAuthenticated) => {
      if (!isAuthenticated) {
        logout(r)
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
        <DocSection isOpen={isOpen} onOpen={onOpen} onOpenChange={onOpenChange}/>
        <div className="flex flex-col m-auto w-[100%] max-w-[700px] h-auto bg-[#F9FAFC] shadow-lg rounded-2xl md:max-w-[100%] ">
        <Navbar 
        Component={()=><>
        <span className="m-auto mt-3 text-lg opacity-65 sm:text-sm sm:mt-0 text-center px-20">
          Visualize, acesse e crie novos endpoints com facilidade. Clique em um para gerenciar ou adicione um novo. <br />
         <span>Acesse a documentação </span> <button onClick={onOpen} className="underline text-blue-600">clicando aqui</button>
          </span>
        </>}
        onClick={()=>logout(r)} 
        Icon={()=> {return <>
        <svg xmlns="http://www.w3.org/2000/svg" height="70px" viewBox="0 -960 960 960" width="30px" fill="red">
        <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/></svg>
        </>}} 
        text=""/>
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
            {!loading?(Array.isArray(filteredData) && filteredData.map((e:any,i:number) => (
              <div key={i}><ItemUser name={e.name} email={e.email} onDelete={handleUserDelete}/></div>
            ))):null}
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
    </div>
  );
}


function DocSection({ isOpen, onOpen, onOpenChange }: any) {
  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement={"center"} scrollBehavior={'inside'}>
        <ModalContent className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-2xl">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-3xl font-bold text-gray-900 bg-white py-6 px-8 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="text-blue-600">📄</span>
                  <span>Documentação do Sistema Dirrocha CMS</span>
                </div>
                <p className="text-sm font-normal text-gray-500 mt-1">
                  Guia completo para gerenciamento de endpoints e itens.
                </p>
              </ModalHeader>
              <ModalBody className="space-y-6 py-0">
                {/* Seção de Documentação do Projeto */}
                <div className=" py-8 rounded-xl">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="p-3 bg-blue-50 rounded-full text-blue-600">📄</span>
                    <span>Gerenciamento de Endpoints e Itens</span>
                  </h1>

                  {/* Criar um Endpoint */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="p-2 bg-blue-50 rounded-md text-blue-600">⚙️</span>
                      Criar um Endpoint
                    </h2>
                    <p className="text-gray-700 leading-relaxed pl-10">
                      Para criar um novo endpoint, clique no botão de{" "}
                      <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-medium shadow-sm">
                        Configuração
                      </span>
                      . Preencha o nome do endpoint como deseja chamá-lo e, em seguida, selecione os campos que deseja incluir. Para finalizar, clique em{" "}
                      <span className="inline-block bg-green-50 text-green-700 px-3 py-1 rounded-md text-sm font-medium shadow-sm">
                        Salvar
                      </span>
                      .
                    </p>
                  </div>

                  {/* Acessar a API de um Endpoint */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="p-2 bg-purple-50 rounded-md text-purple-600">🔗</span>
                      Acessar a API de um Endpoint
                    </h2>
                    <p className="text-gray-700 leading-relaxed pl-10">
                      Na página inicial, ao acessar um endpoint, na parte superior haverá um link que direciona para a API específica daquele endpoint.
                    </p>
                  </div>

                  {/* Cadastrar um Item */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="p-2 bg-green-50 rounded-md text-green-600">➕</span>
                      Cadastrar um Item
                    </h2>
                    <p className="text-gray-700 leading-relaxed pl-10">
                      Para cadastrar um novo item em um endpoint, acesse o endpoint desejado e clique no botão{" "}
                      <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-medium shadow-sm">
                        Adicionar
                      </span>
                      . Preencha os campos com as informações do item e clique em{" "}
                      <span className="inline-block bg-green-50 text-green-700 px-3 py-1 rounded-md text-sm font-medium shadow-sm">
                        Salvar
                      </span>{" "}
                      para finalizar.
                    </p>
                  </div>

                  {/* Editar ou Excluir um Item */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="p-2 bg-yellow-50 rounded-md text-yellow-600">✏️</span>
                      Editar ou Excluir um Item
                    </h2>
                    <p className="text-gray-700 leading-relaxed pl-10">
                      Para editar ou excluir um item, acesse o endpoint e clique no item desejado. Na página de detalhes, você poderá alterar as informações ou excluir o item. Para salvar as alterações, clique em{" "}
                      <span className="inline-block bg-green-50 text-green-700 px-3 py-1 rounded-md text-sm font-medium shadow-sm">
                        Salvar
                      </span>
                      . Na parte superior da página, há um link clicável que leva diretamente ao item específico na API.
                    </p>
                  </div>
                </div>
              </ModalBody>

              <ModalFooter className="bg-white py-6 px-8 border-t border-gray-200">
                <Button
                  color="primary"
                  onPress={() => { onClose() }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105 shadow-md"
                >
                  Fechar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}