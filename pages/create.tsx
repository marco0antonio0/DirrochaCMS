import Image from "next/image";
import localFont from "next/font/local";
import { MouseEventHandler, useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { addEndpoint } from "@/services/addEndpoint";
import Cookies from "js-cookie";
import axios from "axios";
import { logout } from "@/services/logout";
import toast from "react-hot-toast";

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
  const [selected_titulo, setSelected_titulo] = useState(false);
  const [selected_data, setSelected_data] = useState(false);
  const [selected_link, setSelected_link] = useState(false);
  const [selected_preco, setSelected_preco] = useState(false);
  const [selected_nome, setSelected_nome] = useState(false);
  const [selected_descricao, setSelected_descricao] = useState(false);
  const [selected_breve_descricao, setSelected_breve_descricao] = useState(false);
  const [selected_texto, setSelected_texto] = useState(false);
  const [selected_artigo, setSelected_artigo] = useState(false);
  const [selected_senha, setSelected_senha] = useState(false);
  const [selected_image, setSelected_image] = useState(false);
  const [nomeEndpoint, setNomeEndpoint] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ nomeEndpoint: false, campos: false });
  const r = useRouter()
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

  const formatarNomeEndpoint = (nome: string): string => {
    return nome.replace(/\s+/g, "_");
  };

  const getSelectedFields = () => {
    const selectedFields = {
      titulo: selected_titulo,
      data: selected_data,
      nome: selected_nome,
      breve_descricao: selected_breve_descricao,
      descricao: selected_descricao,
      texto: selected_texto,
      artigo: selected_artigo,
      senha: selected_senha,
      image: selected_image,
      link: selected_link,
      preco: selected_preco,
    };

    return Object.keys(selectedFields).filter((key) => selectedFields[key as keyof typeof selectedFields]);
  };

  const validateFields = () => {
    const isNomeVazio = nomeEndpoint.trim() === "";
    const isCamposVazio = getSelectedFields().length === 0;

    setErrors({ nomeEndpoint: isNomeVazio, campos: isCamposVazio });

    return !isNomeVazio && !isCamposVazio;
  };

  const validarNomeEndpoint = (nome: string): boolean => {
    return /^[a-zA-Z0-9_]+$/.test(nome);
  };

  const saveData = async () => {
    const toastId = toast.loading("Criando endpoint ...",{duration:4000});
    if (!validateFields()) {
      return;
    }
    setLoading(true);
  
    try {
      const result = await addEndpoint(nomeEndpoint, nomeEndpoint, getSelectedFields());
  
      if (result && result.success) {
        setTimeout(() => {
          setLoading(false);
          toast.dismiss(toastId)
          toast.success("Endpoint criado com sucesso",{duration:4000});
          r.push("/home");
        }, 1000);
      } else {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    } catch (error) {
      toast.dismiss(toastId)
      toast.error("Erro ao criar o endpoint ",{duration:4000});
      console.error("Erro ao adicionar endpoint:", error);
      setLoading(false);
    }
  };
  return (
    
    <div
      className={`${geistSans.variable} ${geistMono.variable} grid grid-rows-[20px_1fr_20px] items-center w-[100%] justify-items-center min-h-screen p-8 pb-20 gap-16 sm:py-10 sm:px-3 font-[family-name:var(--font-geist-sans)]`}
    >
      <Head>
      <title>Adicionar Endpoint | Plataforma | Gerenciamento de Conteúdos</title>
      <meta name="description" content="Plataforma de gerenciamento de conteúdos e endpoints" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-[100%] h-auto">
        {
        <div className="flex flex-col m-auto w-[100%] max-w-[700px] h-auto bg-[#F9FAFC] shadow-lg rounded-2xl md:max-w-[100%]">
          <div className="relative m-auto mt-0 bg-[#FFFFFF] w-[100%] h-[40%] rounded-t-2xl shadow-sm flex flex-col sm:h-[30%] py-8">
            {/* Botão de voltar no canto superior esquerdo */}
            <button className="absolute left-6 top-10 md:top-6 p-2 rounded-full hover:bg-gray-200 transition" onClick={() => {
              r.push("/home")
              // setItemSelected(null)
              // setImage(null)
              }}>
              <svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="30px" fill="black">
                <path d="M400-240 160-480l240-240 56 58-142 142h486v80H314l142 142-56 58Z"/>
              </svg>
            </button>
            {/* Título e descrição */}
            <h1 className="m-auto mb-0 text-3xl font-semibold sm:text-2xl">DIRROCHA CMS</h1>
            <span className="m-auto mt-3 text-lg opacity-65 sm:text-sm sm:mt-0 text-center px-16">Configure o nome e os campos necessários para estruturar seu endpoint de forma rápida e eficiente.</span>
          </div>
          <div className="flex flex-col h-[100%] w-[100%] mt-5 px-20 lg:px-10">
            
            <div className="h-5"></div>
            <h1 className="m-auto mt-3 mb-1 ml-0 opacity-65 sm:text-sm">Qual sera o nome do endpoint?</h1>
            <input
              type="text"
              className={`m-auto mt-0 mb-0 w-[100%] h-14 rounded-lg ${errors.nomeEndpoint ? "border-red-500" : "border-gray-200"} border-2 px-5 sm:h-12`}
              placeholder="Digite o nome do endpoint"
              value={nomeEndpoint}
              onChange={(e) => {
                const valor = e.target.value;
                if (validarNomeEndpoint(valor) || valor === "") {
                  setNomeEndpoint(valor);
                  validateFields(); // Valida campos ao digitar
                }
              }}
            />

            {errors.nomeEndpoint && <p className="text-red-500 text-sm mt-1">O nome do endpoint é obrigatório.</p>}
            <div className="h-5"></div>
            <h1 className="m-auto mt-3 mb-3 ml-0 opacity-65 sm:text-sm">Quais campos voce quer no endpoint?</h1>
            <div className="flex flex-col gap-3">
              <SwitchToggle title="Titulo" desc="Campo de texto simples" value={selected_titulo} setValue={setSelected_titulo} onChange={()=>validateFields()}/>
              <SwitchToggle title="Data" desc="Campo de data dd-mm-yyyy" value={selected_data} setValue={setSelected_data} onChange={()=>validateFields()}/>
              <SwitchToggle title="Descrição" desc="Campo de texto multi linha" value={selected_descricao} setValue={setSelected_descricao} onChange={()=>validateFields()}/>
              <SwitchToggle title="Breve Descrição" desc="Campo de texto multi linha" value={selected_breve_descricao} setValue={setSelected_breve_descricao} onChange={()=>validateFields()}/>
              <SwitchToggle title="Artigo" desc="Campo de texto multi linha" value={selected_artigo} setValue={setSelected_artigo} onChange={()=>validateFields()}/>
              <SwitchToggle title="Imagem" desc="Campo de imagem" value={selected_image} setValue={setSelected_image} onChange={()=>validateFields()}/>
              <SwitchToggle title="Nome" desc="Campo de texto simples" value={selected_nome} setValue={setSelected_nome} onChange={()=>validateFields()}/>
              <SwitchToggle title="Senha" desc="Campo de texto simples" value={selected_senha} setValue={setSelected_senha} onChange={()=>validateFields()}/>
              <SwitchToggle title="Texto" desc="Campo de texto multi linha" value={selected_texto} setValue={setSelected_texto} onChange={()=>validateFields()}/>
              <SwitchToggle title="Link" desc="Campo de texto simples" value={selected_link} setValue={setSelected_link} onChange={()=>validateFields()}/>
              <SwitchToggle title="Preço" desc="Campo de texto simples" value={selected_preco} setValue={setSelected_preco} onChange={()=>validateFields()}/>
              {errors.campos && <p className="text-red-500 text-sm mt-1">Selecione pelo menos um campo.</p>}
            </div>

            <div className="h-5"></div>
            <button className="align-middle w-[100%] h-14 border-2 border-gray-200 rounded-md mt-0 flex justify-center items-center bg-blue-500 text-white" onClick={()=>{saveData()}}>
                {loading ? <span className="loader border-4 border-black border-t-transparent rounded-full w-6 h-6 animate-spin"></span> : "Criar endpoint"}
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

import {Switch, cn} from "@heroui/react";

export function SwitchToggle({title,desc,value,setValue,onChange}:{title:string,desc:string,value:any,setValue:any,onChange:any}) {
  return (
    <Switch  isSelected={value} onValueChange={setValue} onChange={onChange}
      className="touch-manipulation"
      classNames={{
        base: cn(
          "inline-flex flex-row-reverse w-full max-w-md bg-content1 hover:bg-content2 items-center",
          "justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent",
          "data-[selected=true]:border-primary",
          "touch-manipulation"
        ),
        wrapper: "p-0 h-4 overflow-visible",
        thumb: cn(
          "w-6 h-6 border-2 shadow-lg",
          "group-data-[hover=true]:border-primary",
          //selected
          "group-data-[selected=true]:ms-6",
          // pressed
          "group-data-[pressed=true]:w-7",
          "group-data-[selected]:group-data-[pressed]:ms-4",
        ),
      }}
    >
      <div className="flex flex-col gap-1">
        <p className="text-medium">{title}</p>
        <p className="text-tiny text-default-400">
          {desc}
        </p>
      </div>
    </Switch>
  );
}