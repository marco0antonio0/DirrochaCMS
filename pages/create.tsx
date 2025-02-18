import Image from "next/image";
import localFont from "next/font/local";
import React, { MouseEventHandler, useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import axios from "axios";
import { logout } from "@/services/logout";
import toast from "react-hot-toast";
import { User } from "@/services/user/user";
import { Button, Chip, cn, Code, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Switch, Tab, Tabs, useDisclosure } from "@heroui/react";
import { endpointService } from "@/services/endpointService";
import Navbar from "@/components/navbar";

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
  const [selected, setSelected] = React.useState<string>("Endpoint");
  const [login, setlogin] = useState(false);
  const [register, setregister] = useState(false);
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
        logout(r)
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
      const result = await endpointService.addEndpoint(nomeEndpoint, nomeEndpoint, getSelectedFields());
  
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
          <Navbar 
          Component={null}
          onClick={()=>r.push("/home")} 
          Icon={()=> {return <>
            <svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="30px" fill="black">
                <path d="M400-240 160-480l240-240 56 58-142 142h486v80H314l142 142-56 58Z"/>
            </svg>
          </>}} 
          text="Configure o nome e os campos necessários para estruturar seu endpoint de forma rápida e eficiente."/>
          <div className="flex flex-col h-[100%] w-[100%] mt-5 px-20 lg:px-10">
          <Tabs key={'lg'} aria-label="Tabs sizes" size={'lg'} className="m-auto" selectedKey={selected} onSelectionChange={(key) => setSelected(String(key))}>
            <Tab key="Endpoint" title="Endpoint" />
            <Tab key="Users" title="Users" />
          </Tabs>
            {selected==="Endpoint"?(<>
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
            <Button color="primary" variant="solid" className="h-14" isLoading={loading} onClick={()=>{saveData()}}>
            Criar endpoint
            </Button>
            <div className="h-5"></div>
            <div className="h-1"></div>
            <span className="m-auto"></span>
            </>):(<><UserSettings/> </>)}
            </div>
        </div>
        }
      </main>
    </div>
  );
}


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



const UserSettings: React.FC = () => {
  const [login, setLogin] = useState<boolean>(false);
  const [register, setRegister] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const r = useRouter()
  useEffect(() => {
      async function fetchSettings() {
          const settings = await User.getAuthVisibility();
          setLogin(settings.loginEnabled);
          setRegister(settings.registerEnabled);
      }
      fetchSettings();
  }, []);

  const saveData = async () => {
      const toastId = toast.loading("Salvando alterações ...",{duration:4000});
      setLoading(true);
      const success = await User.setAuthVisibility({ login, register });
      setLoading(false);

      if (success) {
          setTimeout(() => {
            setLoading(false);
            toast.dismiss(toastId)
            toast.success("Alterações salvas com sucesso",{duration:4000});
            r.push("/home");
          }, 1000);
      } else {
          setTimeout(() => {
          toast.dismiss(toastId)
          toast.error("Erro ao salvar alterações",{duration:4000});
          setLoading(false);
        }, 1000);
      }
      toast.dismiss(toastId)
    };

  return (
      <>
          <div className="h-5"></div>
          <h1 className="m-auto mt-3 mb-1 ml-0 opacity-65 sm:text-sm">Sistema de usuários - <span className="text-blue-700 underline select-none cursor-pointer" onClick={onOpen}>Saiba mais</span></h1>
          <div className="h-5"></div>
          <div className="flex flex-col gap-3">
              <SwitchToggle
                  title="Login de usuários"
                  desc="Esta função habilita o sistema de login no endpoint /api/user/login"
                  value={login}
                  setValue={setLogin}
                  onChange={()=>{}}
                  />
              <SwitchToggle
                  title="Registro de usuários"
                  desc="Esta função habilita o sistema de registro de usuários no endpoint /api/user/register"
                  value={register}
                  setValue={setRegister}
                  onChange={()=>{}}
                  />
          </div>
          <div className="h-5"></div>
          <Button color="primary" variant="solid" className="h-14" isLoading={loading} onClick={saveData}>
              Salvar configuração
          </Button>
          <div className="h-5"></div>
          <div className="h-1"></div>
          <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement={"center"}  scrollBehavior={'inside'}>
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader className="flex flex-col gap-1">Saiba mais sobre o Endpoint User</ModalHeader>
                    <ModalBody>
                      <p>
                        Para acessar as funcionalidades do sistema, utilize os endpoints <strong>login</strong> e <strong>register</strong> para autenticação e criação de conta.
                      </p>

                      {/* Seção de Login */}
                      <h1>🔑 <strong>Autenticação - Login</strong></h1>
                      <p>Realize o login enviando uma requisição <strong>POST</strong> para o seguinte endpoint:</p>
                      
                      <div className="flex flex-row items-center gap-2"> 
                        <h2>Endpoint:</h2>
                        <Chip color="primary">/api/user/login</Chip>
                      </div>

                      <p><strong>Método:</strong> POST</p>
                      <p><strong>Corpo da requisição (JSON):</strong></p>

                      <Code size="sm">body: {`{`} <br />
                         "email":"teste@teste.com" , <br />
                         "password":"senha123"<br />
                         {`}`}
                      </Code>

                      <p>
                        Se as credenciais estiverem corretas, o servidor retornará um <strong>token JWT (JSON Web Token)</strong>, 
                        que deverá ser utilizado nas requisições futuras para acessar rotas protegidas do sistema.
                      </p>
                      <p><strong>Exemplo de resposta:</strong></p>
                      <Code size="sm">response: {`{`} <br />
                        "token": "..."<br />
                         {`}`}
                      </Code>
                      <div className="h-10"></div>
                      {/* Seção de Registro */}
                      <h1>📝 <strong>Cadastro - Criar Conta</strong></h1>
                      <p>Para criar um novo usuário, envie uma requisição <strong>POST</strong> para o seguinte endpoint:</p>
                      
                      <div className="flex flex-row items-center gap-2"> 
                        <h2>Endpoint:</h2>
                        <Chip color="primary">/api/user/register</Chip>
                      </div>

                      <p><strong>Método:</strong> POST</p>
                      <p><strong>Corpo da requisição (JSON):</strong></p>

                      <Code size="sm">body: {`{`} <br />
                         "name":"teste" , <br />
                         "email":"teste@teste.com" , <br />
                         "password":"senha123"<br />
                         {`}`}
                      </Code>

                      <p>
                        Se as credenciais estiverem corretas, o servidor retornará um <strong>token JWT (JSON Web Token)</strong>, 
                        que deverá ser utilizado nas requisições futuras para acessar rotas protegidas do sistema.
                      </p>
                      <p><strong>Exemplo de resposta:</strong></p>
                      <Code size="sm">response: {`{`} <br />
                        "token": "..."<br />
                         {`}`}
                      </Code>

                  </ModalBody>

                    <ModalFooter>
                      <Button color="primary" onPress={()=>{
                        onClose()
                      }}>
                        Fechar
                      </Button>
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
            </Modal>
      </>
  );
};
