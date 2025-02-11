import Image from "next/image";
import localFont from "next/font/local";
import { MouseEventHandler, useCallback, useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { getEndpoints } from "@/services/getEndpoints";
import Cookies from "js-cookie";
import axios from "axios";
import { logout } from "@/services/logout";
import debounce from "lodash.debounce";

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
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // Estado para armazenar dados filtrados
  const [isEmptyData, setIsEmptyData] = useState(false); // Estado para verificar se está vazio
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
        console.log(response)
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
  },[])

  useEffect(() => {
    setLoading(true);
    getEndpoints().then((response: any) => {
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
  }, []);
  const handleSearch = useCallback(
    debounce((value: string) => {
      if (!value) {
        setFilteredData(data);
        return;
      }
      
      const filtered = data.filter((item: any) =>
        item.title.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredData(filtered);
    }, 300), // 300ms de debounce para evitar execuções excessivas
    [data]
  );
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
            <div className="h-5"></div>
            <h1 className="m-auto mt-0 mb-1 ml-0 opacity-65 sm:text-sm">Pesquisa</h1>
            <input name="search" type="text" className={`m-auto mt-1 mb-0 w-[100%] h-14 rounded-lg border-gray-200 border-2 px-5 sm:h-12`} placeholder="digite" 
             onChange={(e) => handleSearch(e.target.value)}/>
            <div className="h-5"></div>
            <h1 className="m-auto mt-0 mb-1 ml-0 opacity-65 sm:text-sm">EndPoints</h1>
            {loading ? (
              <span className="loader border-8 border-black border-t-transparent rounded-full w-12 h-12 animate-spin m-auto my-20"></span>
            ) :  isEmptyData ? (  
              <h1 className="m-auto my-10 text-center text-lg">Nenhum dado encontrado</h1>
            ) :null}
            <div className="w-[100%] flex flex-col h-auto gap-3">
                {filteredData.map((e:any,i)=>(<div key={i}><Item text={e.title} onClick={()=>{r.push("/home/"+e.router)}}/></div>))}
            </div>
            <div className="h-5"></div>
            <button className="align-middle w-[100%] h-14 border-2 border-gray-200 rounded-md mt-0 flex justify-center items-center" onClick={()=>{r.push("/create")}}>
                {false ? <span className="loader border-4 border-black border-t-transparent rounded-full w-6 h-6 animate-spin"></span> : "Criar endpoint"}
            </button>
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