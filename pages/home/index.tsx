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
        <div className="flex flex-col m-auto w-[100%] max-w-[700px] h-auto bg-[#F9FAFC] shadow-lg rounded-2xl md:max-w-[100%] ">
        <Navbar 
        Component={null}
        onClick={()=>logout(r)} 
        Icon={()=> {return <>
        <svg xmlns="http://www.w3.org/2000/svg" height="70px" viewBox="0 -960 960 960" width="30px" fill="red">
        <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/></svg>
        </>}} 
        text="Visualize, acesse e crie novos endpoints com facilidade. Clique em um para gerenciar ou adicione um novo."/>
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








