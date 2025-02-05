import Image from "next/image";
import localFont from "next/font/local";
import { useEffect, useState } from "react";
import Head from "next/head";
import axios from "axios";
import Cookies from "js-cookie";
import { getData } from "@/services/storage";
import { useRouter } from "next/router";

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
    firebaseFields: {
      apiKey: false,
      authDomain: false,
      projectId: false,
      storageBucket: false,
      messagingSenderId: false,
      appId: false,
    },
  });
  const [loading, setLoading] = useState(false);
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
      return response;
    } catch (error) {
      // console.error("Erro na autenticação:", error.response?.data);
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
      // console.log("🛠️ Dados retornados de getData():", data);
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
      firebaseFields: {
      apiKey: isFirstAccess && !process.env.NEXT_PUBLIC_ENV ? firebaseCredentials.apiKey.trim() === "" : false,
      authDomain: isFirstAccess && !process.env.NEXT_PUBLIC_ENV ? firebaseCredentials.authDomain.trim() === "" : false,
      projectId: isFirstAccess && !process.env.NEXT_PUBLIC_ENV ? firebaseCredentials.projectId.trim() === "" : false,
      storageBucket: isFirstAccess && !process.env.NEXT_PUBLIC_ENV ? firebaseCredentials.storageBucket.trim() === "" : false,
      messagingSenderId: isFirstAccess && !process.env.NEXT_PUBLIC_ENV ? firebaseCredentials.messagingSenderId.trim() === "" : false,
      appId: isFirstAccess && !process.env.NEXT_PUBLIC_ENV ? firebaseCredentials.appId.trim() === "" : false,
      },
    };
    setErrors(newErrors);
    return !Object.values(newErrors).includes(true);
  }

  async function onClickButton() {
    if (!checkFieldsIsEmpty()) return;
    setLoading(true);

    if(errors.confirmPassword && isFirstAccess) return;
    try {
      if (isFirstAccess) {
    if (credentials.password !== credentials.confirmPassword) {
          setErrors((prev) => ({ ...prev, confirmPassword: true }));
          return;
        }
    let response:any = null
    if(!process.env.NEXT_PUBLIC_ENV){
    try {
       response = await axios.post("/api/firebaseConfig", firebaseCredentials,{
        headers: {
          Authorization: `Bearer ${"lA0qUhYC0MnzpZ8"}`,
        },
      }
    );
    } catch (error) {
      let newErrors = {
        name: credentials.name.trim() === "",
        password: credentials.password.trim() === "",
        confirmPassword: isFirstAccess ? credentials.confirmPassword.trim() === "" : false,
        Unauthorized_firebase:true,
        Unauthorized:false,
        firebaseFields: {
          apiKey: isFirstAccess ? firebaseCredentials.apiKey.trim() === "" : false,
          authDomain: isFirstAccess ? firebaseCredentials.authDomain.trim() === "" : false,
          projectId: isFirstAccess ? firebaseCredentials.projectId.trim() === "" : false,
          storageBucket: isFirstAccess ? firebaseCredentials.storageBucket.trim() === "" : false,
          messagingSenderId: isFirstAccess ? firebaseCredentials.messagingSenderId.trim() === "" : false,
          appId: isFirstAccess ? firebaseCredentials.appId.trim() === "" : false,
        },}
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
            Unauthorized:false,
            firebaseFields: {
              apiKey: isFirstAccess ? firebaseCredentials.apiKey.trim() === "" : false,
              authDomain: isFirstAccess ? firebaseCredentials.authDomain.trim() === "" : false,
              projectId: isFirstAccess ? firebaseCredentials.projectId.trim() === "" : false,
              storageBucket: isFirstAccess ? firebaseCredentials.storageBucket.trim() === "" : false,
              messagingSenderId: isFirstAccess ? firebaseCredentials.messagingSenderId.trim() === "" : false,
              appId: isFirstAccess ? firebaseCredentials.appId.trim() === "" : false,
            },}
          setErrors(newErrors);
          setLoading(false);
          return;
        }}


        await axios.post("/api/register", {
          name: credentials.name,
          password: credentials.password,
        });
      }
      const response = await axios.post("/api/login", {
        name: credentials.name,
        password: credentials.password,
      });

      setTimeout(() => {
        Cookies.set("token", response.data.token, { expires: 1 }); 
        window.location.href = "/home"; 
        setLoading(false);
    }, 0);

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
      setTimeout(() => {
        setLoading(false);
    }, 2000);
    }
  }

  function handleChange(e: any) {
    const { name, value } = e.target;
    
    // console.log(`🛠️ Alteração detectada: ${name} = "${value}"`);
  
    setFirebaseCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  
    setErrors((prev) => {
      const isEmpty = value.trim() === "";
      return {
        ...prev,
        firebaseFields: {
          ...prev.firebaseFields,
          [name]: isEmpty,
        },
      };
    });
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
          {isFirstAccess && !process.env.NEXT_PUBLIC_ENV && (
              <>
              <h1 className="m-auto mt-5 mb-0 ml-0 sm:text-sm">Credenciais firebase</h1>
              <h1 className="m-auto mt-5 mb-0 ml-0 opacity-65 sm:text-sm">APP_KEY</h1>
              <input name="apiKey" type="text" className={`m-auto mt-1 mb-0 w-[100%] h-14 rounded-lg ${errors.firebaseFields['apiKey']?"border-red-500":"border-gray-200"}  border-2 px-5 sm:h-12`} placeholder="digite" onChange={handleChange}/>
              {errors.firebaseFields['apiKey'] && (<span className="text-red-500 text-sm">Campo obrigatório</span>)}
                
              <div className={`${isFirstAccess && !process.env.NEXT_PUBLIC_ENV?"h-0":"h-5"}`}></div>
              <h1 className="m-auto mt-5 mb-0 ml-0 opacity-65 sm:text-sm">AUTH_DOMAIN</h1>
              <input name="authDomain" type="text" className={`m-auto mt-1 mb-0 w-[100%] h-14 rounded-lg ${errors.firebaseFields['authDomain']?"border-red-500":"border-gray-200"}  border-2 px-5 sm:h-12`} placeholder="digite" onChange={handleChange}/>
              {errors.firebaseFields['authDomain'] && (<span className="text-red-500 text-sm">Campo obrigatório</span>)}

                 <div className={`${isFirstAccess && !process.env.NEXT_PUBLIC_ENV?"h-0":"h-5"}`}></div>
              <h1 className="m-auto mt-5 mb-0 ml-0 opacity-65 sm:text-sm">PROJECT_ID</h1>
              <input name="projectId" type="text" className={`m-auto mt-1 mb-0 w-[100%] h-14 rounded-lg ${errors.firebaseFields['projectId']?"border-red-500":"border-gray-200"}  border-2 px-5 sm:h-12`} placeholder="digite" onChange={handleChange}/>
              {errors.firebaseFields['projectId'] && (<span className="text-red-500 text-sm">Campo obrigatório</span>)}

              <div className={`${isFirstAccess && !process.env.NEXT_PUBLIC_ENV?"h-0":"h-5"}`}></div>
              <h1 className="m-auto mt-5 mb-0 ml-0 opacity-65 sm:text-sm">STORAGE_BUCKET</h1>
              <input name="storageBucket" type="text" className={`m-auto mt-1 mb-0 w-[100%] h-14 rounded-lg ${errors.firebaseFields['storageBucket']?"border-red-500":"border-gray-200"}  border-2 px-5 sm:h-12`} placeholder="digite" onChange={handleChange}/>
              {errors.firebaseFields['storageBucket'] && (<span className="text-red-500 text-sm">Campo obrigatório</span>)}

              <div className={`${isFirstAccess && !process.env.NEXT_PUBLIC_ENV?"h-0":"h-5"}`}></div>
              <h1 className="m-auto mt-5 mb-0 ml-0 opacity-65 sm:text-sm">MESSAGING_SENDER_ID</h1>
              <input name="messagingSenderId" type="text" className={`m-auto mt-1 mb-0 w-[100%] h-14 rounded-lg ${errors.firebaseFields['messagingSenderId']?"border-red-500":"border-gray-200"}  border-2 px-5 sm:h-12`} placeholder="digite" onChange={handleChange}/>
              {errors.firebaseFields['messagingSenderId'] && (<span className="text-red-500 text-sm">Campo obrigatório</span>)}

                <div className={`${isFirstAccess && !process.env.NEXT_PUBLIC_ENV?"h-0":"h-5"}`}></div>
              <h1 className="m-auto mt-5 mb-0 ml-0 opacity-65 sm:text-sm">APP_ID</h1>
              <input name="appId" type="text" className={`m-auto mt-1 mb-0 w-[100%] h-14 rounded-lg ${errors.firebaseFields['appId']?"border-red-500":"border-gray-200"}  border-2 px-5 sm:h-12`} placeholder="digite" onChange={handleChange}/>
              {errors.firebaseFields['appId'] && (<span className="text-red-500 text-sm">Campo obrigatório</span>)}

                <div className={`${isFirstAccess && !process.env.NEXT_PUBLIC_ENV?"h-0":"h-5"}`}></div>
                {/* <h1 className="m-auto mt-5 mb-0 ml-0 opacity-65 sm:text-sm">SECRET_KEY</h1>
              <input type="text" className={`m-auto mt-1 mb-0 w-[100%] h-14 rounded-lg ${errors.password?"border-red-500":"border-gray-200"}  border-2 px-5 sm:h-12`} placeholder="digite" onChange={handleChange}/>
              
                <div className={`${isFirstAccess?"h-0":"h-5"}`}></div> */}
              </>
            )}
            <div className={`${isFirstAccess?"h-5":""}`}></div>
            <h1 className="m-auto mb-1 ml-0 opacity-65 sm:text-sm">EMAIL ADRESS</h1>
            <input type="email" className={`m-auto mt-0 mb-0 w-[100%] h-14 rounded-lg ${errors.name?"border-red-500":"border-gray-200"} border-2 px-5 sm:h-12`} placeholder="user@email.com" onChange={(e)=>changeCredentials('name',e)}/>
            {errors.name && <span className="text-red-500 text-sm mt-1">Campo Email vazio</span>}
            {errors.Unauthorized && <span className="text-red-500 text-sm mt-1">Campo Email ou Senha incorretos</span>}
            <div className={`${isFirstAccess?"h-5":""}`}></div>
            <div className={`${isFirstAccess?"h-0":"h-5"}`}></div>
            <h1 className="m-auto mt-0 mb-1 ml-0 opacity-65 sm:text-sm">PASSWORD</h1>
            <input type="password" className={`m-auto mt-0 mb-0 w-[100%] h-14 rounded-lg ${errors.password?"border-red-500":"border-gray-200"}  border-2 px-5 sm:h-12`} placeholder="Passwords" onChange={(e)=>changeCredentials('password',e)}/>
            {errors.password && <span className="text-red-500 text-sm mt-1">Campo senha vazio</span>}
            {errors.Unauthorized && <span className="text-red-500 text-sm mt-1">Campo Email ou Senha incorretos</span>}
            {isFirstAccess && (
              <>
              <h1 className="m-auto mt-5 mb-0 ml-0 opacity-65 sm:text-sm">CONFIRM PASSWORD</h1>
              <input type="password" className={`m-auto mt-1 mb-0 w-[100%] h-14 rounded-lg ${errors.password?"border-red-500":"border-gray-200"}  border-2 px-5 sm:h-12`} placeholder="Confirm Password" onChange={(e) => changeCredentials("confirmPassword", e)}/>
                {errors.confirmPassword && <span className="text-red-500 text-sm">Passwords must match</span>}
              </>
            )}
            <div className={`${isFirstAccess?"h-8":"h-5"}`}></div>
            {errors.Unauthorized_firebase && <span className="text-red-500 text-sm mt-1 text-center">Acesso a firestore negado <br />verifique as se as credenciais estão corretas e o firestore esta ativado</span>}
            <div className={`${isFirstAccess?"h-8":"h-5"}`}></div>
            <button className="align-middle w-[100%] h-14 border-2 border-gray-200 rounded-md mt-0 flex justify-center items-center" onClick={onClickButton}>
                {loading ? <span className="loader border-4 border-black border-t-transparent rounded-full w-6 h-6 animate-spin"></span> : "Sign in"}
            </button>
            <div className={`${isFirstAccess?"h-10":""}`}></div>
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
