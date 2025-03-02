import Image from "next/image";
import localFont from "next/font/local";
import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import axios from "axios";
import Cookies from "js-cookie";
import { getData } from "@/services/storage";
import { useRouter } from "next/router";
import { loginUser, registerUser } from "@/services/auth";
import toast from "react-hot-toast";
import { Button } from "@heroui/react";
import { SessaoService } from "@/services/sessaoService";
import { envText } from "@/utils/textExample";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function Home() {
  const [isFirstAccess, setIsFirstAccess] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  const [firebaseCredentials, setFirebaseCredentials] = useState({
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
  });
  const [credentials, setCredentials] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    name: false,
    password: false,
    Unauthorized_firebase:false,
    Unauthorized: false,
    confirmPassword: false,
  });
  const [loading, setLoading] = useState(false);
  async function checkAuth() {
    const token = Cookies.get("token");
    if (!token) {
      return false;
    }
  
    try {
      const response = await axios.get("/api/verifyToken", {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });
  
      return response;
    } catch (error) {
      return false;
    }
  }
  const r = useRouter()
  useEffect(()=>{
    checkAuth().then((isAuthenticated) => {
      if (isAuthenticated) {
        r.push("/home")
      }
    });
  },[])
  useEffect(() => {
    getData().then((data) => {
      setIsFirstAccess(!(data != null) ? true : false);
    });
  }, []);

  function changeCredentials(param: string, value: any) {
    setCredentials((prev) => ({ ...prev, [param]: value.target.value }));
    setErrors((prev) => ({ ...prev, Unauthorized: false })); 
    setErrors((prev) => ({ ...prev, [param]: value.target.value.trim() === "" }));
  }

  function checkFieldsIsEmpty() {
    let newErrors = {
      name: credentials.name.trim() === "",
      password: credentials.password.trim() === "",
      confirmPassword: isFirstAccess ? credentials.confirmPassword.trim() === "" : false,
      Unauthorized_firebase:false,
      Unauthorized:false,
    };
    setErrors(newErrors);
    return !Object.values(newErrors).includes(true);
  }

  async function onClickButton() {
    if (!checkFieldsIsEmpty()) return;
    setLoading(true);

    if(errors.confirmPassword && isFirstAccess) return;
    
    if (isFirstAccess) {toast("Criando conta ...",{duration:4000});}
    try {
    if (isFirstAccess) {
    if (credentials.password !== credentials.confirmPassword) {
          setErrors((prev) => ({ ...prev, confirmPassword: true }));
          return;
        }
    let response:any = null
    if(!process.env.NEXT_PUBLIC_ENV){
    try {
    } catch (error) {
      let newErrors = {
        name: credentials.name.trim() === "",
        password: credentials.password.trim() === "",
        confirmPassword: isFirstAccess ? credentials.confirmPassword.trim() === "" : false,
        Unauthorized_firebase:true,
        Unauthorized:false,
      }
          setLoading(false);
          setErrors(newErrors);
          return null;
    }
        
        if(response!=null && response.status !=200){
          let newErrors = {
            name: credentials.name.trim() === "",
            password: credentials.password.trim() === "",
            confirmPassword: isFirstAccess ? credentials.confirmPassword.trim() === "" : false,
            Unauthorized_firebase:true,
            Unauthorized:false}
          setErrors(newErrors);
          setLoading(false);
          toast.error("Falha ao criar a conta ...",{duration:4000})
          return;
        }}
        const responseRegister = await axios.post("/api/register", {
          name: credentials.name,
          password: credentials.password,
        });
        Cookies.set("token", responseRegister.data.token, { expires: 1 });
        if (responseRegister.data.token) {
          setLoading(false);
          toast.success("Conta criada com sucesso",{duration:4000});
          toast.success("Seja bem vindo(a)",{duration:4000});
            setTimeout(() => {
              window.location.href = "/home";
            }, 0);
          }
        }else{
        const response = await axios.post("/api/login", {
          name: credentials.name,
          password: credentials.password,
        });
        Cookies.set("token", response.data.token, { expires: 1 }); 
        window.location.href = "/home"; 
        setLoading(false);
      }
      

    } catch (error: any) {
      setTimeout(() => {
        if (error.response) {
          const status = error.response.status;
          if (status === 401) {
            setErrors((prev) => ({ ...prev, Unauthorized: true })); 
          } else if (status === 400) {
            setErrors((prev) => ({ ...prev, name: true })); 
          } else {
            console.error(`Erro: ${status} - ${error.response.data?.message || "Erro desconhecido"}`);
          }
        } else {
          console.error("Erro na requisição:", error.message);
        }
        setLoading(false);
    }, 0);
    }finally{
          setLoading(false);
    }
  }


function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
  if (event.key === "Enter") {
    onClickButton();
  }
}
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} grid grid-rows-[20px_1fr_20px] items-center w-[100%] justify-items-center min-h-screen p-8 pb-20 gap-16 sm:py-10 sm:px-3 font-[family-name:var(--font-geist-sans)]`}
    >
      <Head>
        <title>Login Page</title>
        <meta name="description" content="Plataforma de gerenciamento de conteúdos e endpoints" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-[100%]">
        <div className={`flex flex-col m-auto w-[100%] max-w-[700px]  bg-[#F9FAFC] shadow-lg rounded-2xl ${isFirstAccess?"h-auto":"h-[550px] md:max-w-[100%] sm:h-[450px]"} `}>
          <div className={`m-auto mt-0 bg-[#FFFFFF] w-[100%] h-[40%] rounded-t-2xl shadow-sm flex flex-col sm:h-[30%] ${isFirstAccess?"py-8":""}`}>
            <h1 className="m-auto mb-0 text-3xl font-semibold sm:text-2xl">{isFirstAccess ? "Register" : "Sign In"}</h1>
            {isFirstAccess && !process.env.NEXT_PUBLIC_ENV?<span className="m-auto mt-3 text-lg opacity-65 sm:text-sm sm:mt-0 text-left px-20">
👋 Olá, seja bem-vindo! 🚀<br />

🔑 Passo 1: Obtenha suas credenciais do Firebase<br />
📌 Passo 2: Insira suas credenciais nos campos abaixo e ative o Firestore 🔥<br />
📝 Passo 3: Cadastre seu login e senha para começar! ✅<br />
</span>:<span className="m-auto mt-3 text-lg opacity-65 sm:text-sm sm:mt-0 text-left px-20">Use your email and password to sign in</span>}
          </div>
          <div className="flex flex-col h-[100%] w-[100%] px-20 lg:px-10">
          {!(isFirstAccess && !process.env.NEXT_PUBLIC_ENV)?
          <>
           <div className={`${isFirstAccess?"h-5":""}`}></div>
            <h1 className="m-auto mb-1 ml-0 opacity-65 sm:text-sm">EMAIL ADRESS</h1>
            <input onKeyDown={handleKeyDown}  type="email" className={`m-auto mt-0 mb-0 w-[100%] h-14 rounded-lg ${errors.name?"border-red-500":"border-gray-200"} border-2 px-5 sm:h-12`} placeholder="user@email.com" onChange={(e)=>changeCredentials('name',e)}/>
            {errors.name && <span className="text-red-500 text-sm mt-1">Campo Email vazio</span>}
            {errors.Unauthorized && <span className="text-red-500 text-sm mt-1">Campo Email ou Senha incorretos</span>}
            <div className={`${isFirstAccess?"h-5":""}`}></div>
            <div className={`${isFirstAccess?"h-0":"h-5"}`}></div>
            <h1 className="m-auto mt-0 mb-1 ml-0 opacity-65 sm:text-sm">PASSWORD</h1>
            <input onKeyDown={handleKeyDown}  type="password" className={`m-auto mt-0 mb-0 w-[100%] h-14 rounded-lg ${errors.password?"border-red-500":"border-gray-200"}  border-2 px-5 sm:h-12`} placeholder="Passwords" onChange={(e)=>changeCredentials('password',e)}/>
            {errors.password && <span className="text-red-500 text-sm mt-1">Campo senha vazio</span>}
            {errors.Unauthorized && <span className="text-red-500 text-sm mt-1">Campo Email ou Senha incorretos</span>}
            {isFirstAccess && (
              <>
              <h1 className="m-auto mt-5 mb-0 ml-0 opacity-65 sm:text-sm">CONFIRM PASSWORD</h1>
              <input onKeyDown={handleKeyDown}  type="password" className={`m-auto mt-1 mb-0 w-[100%] h-14 rounded-lg ${errors.password?"border-red-500":"border-gray-200"}  border-2 px-5 sm:h-12`} placeholder="Confirm Password" onChange={(e) => changeCredentials("confirmPassword", e)}/>
                {errors.confirmPassword && <span className="text-red-500 text-sm">Passwords must match</span>}
              </>
            )}
            <div className={`${isFirstAccess?"h-8":"h-5"}`}></div>
            {errors.Unauthorized_firebase && <span className="text-red-500 text-sm mt-1 text-center">Acesso a firestore negado <br />verifique as se as credenciais estão corretas e o firestore esta ativado</span>}
            <div className={`${isFirstAccess?"h-8":"h-5"}`}></div>
            <Button color="primary" variant="solid" className="h-16" isLoading={loading} onClick={onClickButton}>
            Sign in
            </Button>
            <div className={`${isFirstAccess?"h-10":""}`}></div>
            <div className="h-1"></div>
            <span className="m-auto">
            </span>
           </>:<>
           <div className="m-auto py-10">
              <h1>Configure as credenciais env conforme ilustro abaixo e refaça o build/deploy:</h1>
              <textarea name="" id="" className="w-[100%] h-[200px] align-middle items-center rounded-lg" readOnly ref={textAreaRef}>
              {envText}
              </textarea>
              <div className="h-5"></div>
              <Button color="primary" variant="solid" className="h-16 w-[100%]" isLoading={loading} onClick={()=>{     
                if (textAreaRef.current) {
                textAreaRef.current.select();
                navigator.clipboard.writeText(envText).then(() => {
                  setCopied(true);
                  toast.success("Env copiado com sucesso",{duration:4000});
                  setTimeout(() => setCopied(false), 2000);
                });
              }}}>
                {loading ? <span className="loader border-4 border-black border-t-transparent rounded-full w-6 h-6 animate-spin"></span> : "Copiar"}
            </Button>
           </div>
           
           </>}
            </div>
        </div>
      </main>
    </div>
  );
}
