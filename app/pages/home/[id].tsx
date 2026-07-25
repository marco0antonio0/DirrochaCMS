"use client"

import localFont from "next/font/local";
import { useCallback, useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { AlertTriangle, Clock, Copy, Database, Dices, History, Inbox, KeyRound, ListChecks, Plus, RefreshCw, Save, Search, Settings, Shield, Trash2 } from "lucide-react";
import {  generateDynamicObject } from "@/app/utils/generateDynamicObject";
import { toKeyValueList } from "@/app/utils/toKeyValueList";
import formatDataToDynamicObject from "@/app/utils/formatDataToDynamicObject";
import { redirectRouter } from "@/app/services/redirectRouter";
import { logout } from "@/app/services/logout";
import toast from "react-hot-toast";
import debounce from "lodash.debounce";
import { optimizeImage } from "@/app/services/optimizeImage";
import { Button as HeroButton } from "@heroui/react";
import { endpointService } from "@/backend/endpoint/endpoint.service";
import { itemService } from "@/backend/item/item.service";
import { historyService } from "@/backend/history/history.service";
import { getCurrentActor } from "@/app/utils/getCurrentActor";
import { AppHeader } from "@/app/components/app-header";
import { Card, CardHeader, CardDescription, CardContent, CardTitle } from "@/app/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Switch } from "@/app/components/ui/switch";
import { Item } from "@/app/components/item";
import { checkAuth } from "@/app/utils/checkAuth";
import { InputComponent, InputDateComponent, InputImageUpload, InputSingleNumberComponent } from "@/app/components/input";
import ButtonDropdown from "@/app/components/dropButtonMenu";

const geistSans = localFont({
  src: "../../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

type EndpointAccessMode = "public" | "password";

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
  const params = useParams<{ id?: string }>()
  const pathname = usePathname()
  const endpointId = params?.id || ""
  const [forceUpdate,setForceUpdate] = useState(0)
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [filteredData, setFilteredData] = useState<any[]>([]); // Estado para armazenar dados filtrados
  const [openModal,setOpenModal] = useState(false)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [confirmRenameOpen, setConfirmRenameOpen] = useState(false)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyEntries, setHistoryEntries] = useState<any[]>([])
  const [endpointSettings, setEndpointSettings] = useState<{
    name: string;
    fixedValuesEnabled: boolean;
    cacheTtlSeconds: number;
    accessMode: EndpointAccessMode;
    accessPassword: string;
  }>({
    name: "",
    fixedValuesEnabled: false,
    cacheTtlSeconds: 300,
    accessMode: "public",
    accessPassword: "",
  })
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [date, setDate] = useState("");
  const [url, setUrl] = useState("");
  const [errorDate, setErrorDate] = useState("");
  const triggerUpdate = () => {
    setForceUpdate(prev => prev + 1);
  };

  useEffect(()=>{
    checkAuth().then((isAuthenticated) => {
      if (!isAuthenticated) { logout(r) } });
  },[])
  useEffect(() => {
    if(endpointId){ redirectRouter(endpointId); }
  }, [endpointId]);
  useEffect(() => {fetchEndPoint(); 
  }, [endpointId]);
  useEffect(() => {
    if (loadingData) { fetchEndItemPoint(); }
  }, [loadingData]);
  useEffect(() => {
    const currentEndpoint: any = data[0]
    if (!currentEndpoint) return

    setEndpointSettings({
      name: currentEndpoint.router || currentEndpoint.title || endpointId,
      fixedValuesEnabled: currentEndpoint.fixedValuesEnabled ?? false,
      cacheTtlSeconds: currentEndpoint.cacheTtlSeconds ?? 300,
      accessMode: currentEndpoint.accessMode ?? "public",
      accessPassword: currentEndpoint.accessPassword ?? "",
    })
  }, [data, endpointId])

  const fetchEndPoint = async () => {
    if (endpointId) {
      try {
        const fetch: any = await endpointService.listEndpoints();
        const objFormated = fetch.data.filter((e: any) => e.title === endpointId);
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
    if (endpointId && data.length > 0) {
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

  function goToItem(value:any){
    var result = dataItem.filter((e:any)=>e.id == value)
    setItemSelected(formatDataToDynamicObject(result[0], data[0]?.['campos'] || []))
    if(result[0]['formattedData']['date']){
      setDate(result[0]['formattedData']['date'])
    }
    if(result[0]['formattedData']['image']){
      setImage(result[0]['formattedData']['image'])
    }
  }

  function requestDeleteItem(value:any){
    var result = dataItem.filter((e:any)=>e.id == value)
    if (!result[0]) return
    setDeleteTarget(formatDataToDynamicObject(result[0], data[0]?.['campos'] || []))
    setOpenModal(true)
  }

  async function refreshData(result:any){
    if (result.success) {
      setTimeout(() => {
        setLoading(false);

        if(!loadingData){
          if(endpointId){
            endpointService.listEndpoints().then((e:any)=>{
              var objFormated = e.data.filter((e:any)=>e.title === endpointId)
              setdata(objFormated)
            })
          }
        }

      }, 1000);
      await fetchEndItemPoint()
      setItemSelected(null)
      setDeleteTarget(null)
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
        return;
    }else{
      setErrors((prev) => ({
        ...prev,
        titulo_identificador: "",
    }));
    }

    setLoading(true);
    var dataValue = itemSelected[0]
    var dataLocal = data.filter((e:any)=>e.title == endpointId)
    const actor = getCurrentActor()
    if(!dataValue["id"]){
    const toastId = toast.loading("Criando item ...",{duration:4000});
    const result = await itemService.createItem({endpointId: dataLocal[0]['id'],items: dataValue["data"]}, actor ?? undefined)
      await refreshData(result)
      toast.success("Item criado com sucesso",{duration:4000});
      toast.dismiss(toastId)
    }else{
    const toastId = toast.loading("Atualizando item ...",{duration:4000});
    toast.success("Item atualizado com sucesso",{duration:4000});
      const result = await itemService.updateItem({itemId: dataValue["id"],endpointId: dataValue["id_endpoint"],items: dataValue["data"]}, actor ?? undefined)
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
    var dataLocal = data.filter((e:any)=>e.title == endpointId) 
    var objFormated = generateDynamicObject(dataLocal[0]['campos'])
    setItemSelected([objFormated])
  }

 async function deleteItemBy_Id() {
    setLoading(true)
    const target = deleteTarget || itemSelected
    const itemId = target[0]['id']
    const endpointId = target[0]['id_endpoint']
    const actor = getCurrentActor()
    const result = await itemService.deleteItem({itemId, endpointId}, actor ?? undefined)
    if(dataItem.length == 1 || dataItem.length == 0){
      setdataItem([])
     }
    await refreshData(result)
  }

  async function deleteEndpoint() {
    setLoading(true)
    const fetch: any = await endpointService.listEndpoints();
    const objFormated = fetch.data.filter((e: any) => e.title === endpointId);
    const result = await endpointService.deleteEndpoint(objFormated[0]['id'])
    await refreshData(result)
    r.push("/home")

   }


   useEffect(() => {
     if (typeof window !== "undefined") {
       const hostname = window.location.hostname;
       let protocol = "https://";
       let port = "";
   
       if (hostname === "0.0.0.0" || hostname === "localhost") {
         protocol = "http://";
         port = ":3000"; 
       }
   
       const fullUrl = `${protocol}${hostname}${port}/api/${endpointId}`;
       setUrl(fullUrl);
     }
   }, [pathname, endpointId]);
 
   const formatDateToDDMMYYYY = (input: string) => {
     if (input.includes("-")) {
       const [year, month, day] = input.split("-");
       return `${day}/${month}/${year}`;
     }
     return input;
   };
 
   const validateDate = (input: string) => {
     const dateRegex = /^(?:19|20)\d\d-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/
;
     if (!dateRegex.test(input)) {
       setErrorDate("Data inválida! Use o formato dd/mm/yyyy");
       return true
     } else {
       setErrorDate("");
       return false
     }
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
        setFilteredData(dataItem); 
        return;
      }
  
      const filtered = dataItem.filter((item: any) =>
        item?.formattedData?.titulo_identificador?.toLowerCase().includes(value.toLowerCase())
      );
  
      setFilteredData(filtered);
    }, 300),
    [dataItem] 
  );
  useEffect(() => {
    setFilteredData(dataItem); 
  }, [dataItem]); 

  const copyUrl = async (value: string) => {
    if (!value) return

    try {
      await navigator.clipboard.writeText(value)
      toast.success("URL copiada")
    } catch (error) {
      toast.error("Não foi possível copiar a URL")
    }
  }

  const validateEndpointName = (name: string) => {
    return /^[a-zA-Z0-9_]+$/.test(name)
  }

  const saveEndpointSettings = async ({ rename }: { rename: boolean }) => {
    const currentEndpoint: any = data[0]
    const nextName = endpointSettings.name.trim()
    const ttl = Number(endpointSettings.cacheTtlSeconds)

    if (!currentEndpoint?.id) return
    if (!nextName) {
      toast.error("Informe o nome do endpoint")
      return
    }
    if (!validateEndpointName(nextName)) {
      toast.error("Use apenas letras, números e underscores no nome do endpoint")
      return
    }
    if (!Number.isFinite(ttl) || ttl < 0) {
      toast.error("Informe um TTL válido")
      return
    }
    if (endpointSettings.accessMode === "password" && !endpointSettings.accessPassword.trim()) {
      toast.error("Informe uma senha para deixar o endpoint privado")
      return
    }

    setSettingsLoading(true)
    try {
      const payload = {
        fixedValuesEnabled: endpointSettings.fixedValuesEnabled,
        cacheTtlSeconds: ttl,
        accessMode: endpointSettings.accessMode,
        accessPassword: endpointSettings.accessMode === "password" ? endpointSettings.accessPassword.trim() : "",
        ...(rename ? { title: nextName, router: nextName } : {}),
      }
      const actor = getCurrentActor()
      const currentName = currentEndpoint.router || currentEndpoint.title || endpointId
      const summary = rename
        ? `Endpoint renomeado de "${currentName}" para "${nextName}"`
        : "Configurações do endpoint atualizadas"
      const result = await endpointService.updateEndpoint(currentEndpoint.id, payload, actor ?? undefined, summary)

      if (!result.success) {
        toast.error("Erro ao salvar configurações")
        return
      }

      toast.success(rename ? "Endpoint renomeado com sucesso" : "Configurações salvas")
      setSettingsModalOpen(false)
      setConfirmRenameOpen(false)

      if (rename && nextName !== endpointId) {
        r.push(`/home/${nextName}`)
        return
      }

      setdata((prev: any) => prev.map((endpoint: any) => (
        endpoint.id === currentEndpoint.id ? { ...endpoint, ...payload } : endpoint
      )))
    } catch (error) {
      toast.error("Erro ao salvar configurações")
    } finally {
      setSettingsLoading(false)
    }
  }

  const refreshEndpointCache = async () => {
    const currentEndpoint: any = data[0]
    if (!currentEndpoint?.id) return

    setSettingsLoading(true)
    try {
      const result = await endpointService.refreshEndpointCache(currentEndpoint.id)
      if (!result.success) {
        toast.error("Erro ao atualizar cache")
        return
      }

      const cacheRefreshedAt = new Date()
      setdata((prev: any) => prev.map((endpoint: any) => (
        endpoint.id === currentEndpoint.id ? { ...endpoint, cacheRefreshedAt } : endpoint
      )))
      toast.success("Cache atualizado")
    } catch (error) {
      toast.error("Erro ao atualizar cache")
    } finally {
      setSettingsLoading(false)
    }
  }

  const openHistory = async () => {
    setHistoryModalOpen(true)
    const currentEndpoint: any = data[0]
    if (!currentEndpoint?.id) return

    setHistoryLoading(true)
    try {
      const result: any = await historyService.list(currentEndpoint.id)
      setHistoryEntries(result?.data || [])
    } catch (error) {
      toast.error("Erro ao carregar histórico")
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleSaveEndpointSettings = () => {
    const currentEndpoint: any = data[0]
    const nextName = endpointSettings.name.trim()
    const currentName = currentEndpoint?.router || currentEndpoint?.title || endpointId

    if (nextName !== currentName) {
      setConfirmRenameOpen(true)
      return
    }

    saveEndpointSettings({ rename: false })
  }

  const endpointName = (endpointId as string) || ""

  let headerPage = ""
  let headerOnBack: string | (() => void) = "/home"
  let headerActions: React.ReactNode = null

  if (openModal) {
    headerPage = "Confirm deletion"
    headerOnBack = () => {
      setOpenModal(false)
      setDeleteTarget(null)
    }
  } else if (itemSelected) {
    headerPage = itemSelected[0]['id'] != null ? "Edit item" : "New item"
    headerOnBack = () => {
      setItemSelected(null)
      setImage(null)
      setErrorDate("")
      setDate("")
    }
    headerActions = loading && itemSelected[0]['id'] ? (
      <span className="loader border-4 border-black border-t-transparent rounded-full w-6 h-6 animate-spin" />
    ) : itemSelected[0]['id'] != null ? (
      <ButtonDropdown actiondelet={() => { setOpenModal(true) }} addItem={() => { createDados() }} isItem={true} />
    ) : null
  } else {
    headerPage = endpointName
    headerOnBack = "/home"
    headerActions = !loadingData || loading ? (
      <span className="loader border-4 border-black border-t-transparent rounded-full w-6 h-6 animate-spin" />
    ) : (
      <ButtonDropdown actiondelet={() => { setOpenModal(true) }} addItem={() => { createDados() }} isItem={false} />
    )
  }

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-[family-name:var(--font-geist-sans)]`}
    >
      <AppHeader page={headerPage} onBack={headerOnBack} actions={headerActions} />

      <main className="mx-auto max-w-5xl px-3 py-4 smi:px-6 smi:py-8 lgi:px-8">
        {openModal ?
        // ====================================================================================================================================
        //                                              ModalConfirm
        // ====================================================================================================================================
        <ModalConfirmActionDelete setOpenModal={setOpenModal} setDeleteTarget={setDeleteTarget} loadingData={loadingData} itemSelected={deleteTarget || itemSelected} deleteItemBy_Id={deleteItemBy_Id} loading={loading} deleteEndpoint={deleteEndpoint} r={r} /> :
        !itemSelected?
        // ====================================================================================================================================
        //                                                  Lista de itens
        // ====================================================================================================================================
        <Card className="overflow-hidden border-slate-200 bg-white shadow-xl">
          <CardHeader className="border-b border-slate-100 bg-slate-50/70 p-4 smi:p-6">
            <div className="flex flex-col gap-4 smi:flex-row smi:items-start smi:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm smi:h-11 smi:w-11">
                    <Database className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <CardTitle className="truncate text-xl text-slate-950 smi:text-2xl">{endpointName}</CardTitle>
                    <CardDescription className="text-sm text-slate-600">
                      Consulte e mantenha os registros desse endpoint.
                    </CardDescription>
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-col gap-2 smi:w-auto smi:flex-row">
                <button
                  type="button"
                  onClick={() => copyUrl(url)}
                  className="inline-flex w-full max-w-full items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-left text-sm font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 smi:w-auto"
                  title="Copiar URL da API"
                >
                  <Copy className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 truncate">{url}</span>
                </button>
                <div className="grid grid-cols-2 gap-2 smi:contents">
                  <button
                    type="button"
                    onClick={openHistory}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 smi:w-10 smi:px-0"
                    title="Histórico do endpoint"
                  >
                    <History className="h-4 w-4" />
                    <span className="smi:hidden">Histórico</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettingsModalOpen(true)}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 smi:w-10 smi:px-0"
                    title="Configurações do endpoint"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="smi:hidden">Configurações</span>
                  </button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 smi:p-6">
          {loadingData?<>
            <div className="grid gap-4 smi:grid-cols-[1fr_auto] smi:items-end">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Pesquisa</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    name="search"
                    type="text"
                    className="h-12 w-full rounded-md border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Buscar por titulo identificador"
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>

              <HeroButton color="primary" className="h-12 w-full px-5 smi:w-auto" isLoading={loading} onClick={()=>{createDados()}}>
                <Plus className="h-4 w-4" />
                Adicionar dados
              </HeroButton>
            </div>

            <div className="mt-6 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <ListChecks className="h-4 w-4 text-blue-600" />
                Listagem
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {filteredData.length} registro{filteredData.length === 1 ? "" : "s"}
              </span>
            </div>

            {filteredData.length === 0 ? (
              <div className="mt-5 flex min-h-56 flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-white text-slate-500 shadow-sm">
                  <Inbox className="h-6 w-6" />
                </span>
                <h2 className="text-base font-semibold text-slate-900">Nenhum dado encontrado</h2>
                <p className="mt-1 max-w-md text-sm text-slate-500">
                  Crie o primeiro registro ou ajuste o termo pesquisado.
                </p>
                <HeroButton color="primary" variant="flat" className="mt-5 h-11 w-full smi:w-auto" isLoading={loading} onClick={()=>{createDados()}}>
                  <Plus className="h-4 w-4" />
                  Novo registro
                </HeroButton>
              </div>
            ) : (
              <div className="mt-5 grid gap-3" key={forceUpdate}>
                {filteredData.map((e,i)=> (
                  <Item key={e.id || i} text={e['formattedData'].titulo_identificador} onClick={()=>{goToItem(e.id)}} onDelete={()=>{requestDeleteItem(e.id)}}/>
                ))}
              </div>
            )}
            </>:<div className="flex min-h-72 items-center justify-center"><span className="loader h-12 w-12 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" /></div>}
          </CardContent>
        </Card>:
        // ====================================================================================================================================
        //                                                       Item selecionado
        // ====================================================================================================================================
        <Card className="overflow-hidden border-slate-200 bg-white shadow-xl">
          <CardHeader className="border-b border-slate-100 bg-slate-50/70 p-4 smi:p-6">
            <div className="space-y-2">
              <CardTitle className="text-xl text-slate-950 smi:text-2xl">
                {itemSelected[0]['id'] != null ? "Editar registro" : "Novo registro"}
              </CardTitle>
              <CardDescription className="text-sm text-slate-600">
                {itemSelected[0]['id'] != null ?
                  "Atualize os campos e salve as alterações." :
                  "Preencha os campos abaixo para criar um novo item."}
              </CardDescription>
              {itemSelected[0]['id'] != null ? (
                <button
                  type="button"
                  onClick={() => copyUrl(url+"?t="+itemSelected[0]['data'][0]["value"])}
                  className="inline-flex w-full max-w-full items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-left text-sm font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 smi:w-auto"
                  title="Copiar URL da API"
                >
                  <Copy className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 truncate">{url+"?t="+itemSelected[0]['data'][0]["value"]}</span>
                </button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="p-4 smi:p-6">
            {itemSelected?itemSelected[0]['data'].map((e:any,i:any)=>{

            switch (e.type) {
              case "string":
                return <div key={i}>
                  <InputComponent data={{"title" : e.title, "value" : e.value , "itemSelected" : itemSelected, "setItemSelected" : setItemSelected, "setErrors" : setErrors, "i":i}} multiline={e.mult}/>
                  </div>
              case "number":
                return <div key={i}>
                  <InputSingleNumberComponent data={{"title" : e.title, "value" : e.value , "itemSelected" : itemSelected, "setItemSelected" : setItemSelected, "setErrors" : setErrors, "i":i}}/>
                  </div>
              case "img":
                return <div key={i}>
                  <InputImageUpload file={handleFileChange} handleDrop={handleDrop} image={image} title={e.title}/>
                  </div>
              case "date":
                return <div key={i}>
                <InputDateComponent title={e.title} value={e.value} itemSelected={itemSelected} setItemSelected={setItemSelected} errorDate={errorDate} validateDate={validateDate} handleDateChange={handleDateChange} setDate={setDate} date={date} i={i}/>
                </div>
              default:
                return null;
            }
            }):null}

            {errors.titulo_identificador && (
              <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                Campo titulo identificador não pode ser vazio
              </div>
            )}
            <div className="mt-6 flex flex-col-reverse gap-3 smi:flex-row smi:justify-end">
              {itemSelected[0]['id'] != null ? (
                <HeroButton
                  color="danger"
                  variant="flat"
                  className="h-12 w-full px-6 smi:w-auto"
                  isDisabled={loading}
                  onClick={() => {
                    setDeleteTarget(null)
                    setOpenModal(true)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir registro
                </HeroButton>
              ) : null}
              <HeroButton color="primary" variant="solid" className="h-12 w-full px-6 smi:w-auto" isLoading={loading} onClick={()=>{saveData()}}>
                <Save className="h-4 w-4" />
                Salvar dados
              </HeroButton>
            </div>
          </CardContent>
        </Card>
        }
      </main>

      <EndpointSettingsDialog
        open={settingsModalOpen}
        onOpenChange={setSettingsModalOpen}
        settings={endpointSettings}
        setSettings={setEndpointSettings}
        loading={settingsLoading}
        onSave={handleSaveEndpointSettings}
        onRefreshCache={refreshEndpointCache}
      />

      <ConfirmEndpointRenameDialog
        open={confirmRenameOpen}
        onOpenChange={setConfirmRenameOpen}
        currentName={(data[0] as any)?.router || endpointId}
        nextName={endpointSettings.name.trim()}
        loading={settingsLoading}
        onConfirm={() => saveEndpointSettings({ rename: true })}
      />

      <HistoryDialog
        open={historyModalOpen}
        onOpenChange={setHistoryModalOpen}
        loading={historyLoading}
        entries={historyEntries}
      />
    </div>
  );
}


function ModalConfirmActionDelete({setOpenModal,setDeleteTarget,loadingData,itemSelected,deleteItemBy_Id,loading,deleteEndpoint,r}:any){
  const cancelDelete = () => {
    setOpenModal(false)
    setDeleteTarget?.(null)
  }

  return (
    <Card className="mx-auto max-w-2xl overflow-hidden border-red-100 bg-white shadow-xl">
      <CardHeader className="border-b border-red-100 bg-red-50/70 p-4 smi:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-red-100 text-red-700 smi:h-11 smi:w-11">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="space-y-1">
            <CardTitle className="text-lg text-slate-950 smi:text-xl">Confirmar exclusão</CardTitle>
            <CardDescription className="text-sm text-slate-600">
              Essa ação é irreversível e não poderá ser desfeita.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 smi:p-6">
        {loadingData?<>
          <p className="text-sm leading-6 text-slate-700">
            Você deseja deletar {itemSelected ? `o registro "${itemSelected[0]['data'][0]["value"]}"` : "este endpoint"}?
          </p>
          <div className="mt-6 flex flex-col-reverse gap-3 smi:flex-row smi:justify-end">

          <HeroButton variant="flat" className="h-12 w-full smi:w-32" onClick={cancelDelete}>
              Não
          </HeroButton>
          <HeroButton color="danger" className="h-12 w-full smi:w-40" onClick={async()=> {
              checkAuth().then((isAuthenticated) => {
                if (!isAuthenticated) {
                  logout(r)
                }else{
                  itemSelected?deleteItemBy_Id():  deleteEndpoint()
                }
              });
          }}>
              {loading ? <span className="loader h-5 w-5 rounded-full border-2 border-white/40 border-t-white animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Excluir
          </HeroButton>
          </div>
          </>:<div className="flex min-h-40 items-center justify-center"><span className="loader h-12 w-12 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" /></div>}
      </CardContent>
    </Card>
  )
}

function EndpointSettingsDialog({ open, onOpenChange, settings, setSettings, loading, onSave, onRefreshCache }: any) {
  const generateSecurePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*?"
    const randomValues = new Uint32Array(18)
    crypto.getRandomValues(randomValues)
    const password = Array.from(randomValues, (value) => chars[value % chars.length]).join("")

    setSettings((prev: any) => ({
      ...prev,
      accessMode: "password",
      accessPassword: password,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[calc(100vw-24px)] overflow-y-auto smi:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Configurações do endpoint
          </DialogTitle>
          <DialogDescription>
            Ajuste o nome público da rota e as regras de cache desse endpoint.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Nome do endpoint</label>
            <input
              value={settings.name}
              onChange={(event) => setSettings((prev: any) => ({ ...prev, name: event.target.value }))}
              placeholder="ex: produtos"
              className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <p className="text-xs leading-5 text-slate-500">
              Esse nome também define a URL pública em `/api/nome_do_endpoint`.
            </p>
          </div>

          <div className="rounded-md border border-slate-200 p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                <Shield className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1 space-y-4">
                <div>
                  <p className="font-semibold text-slate-900">Acesso da API</p>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Público mantém `/api/{settings.name || "endpoint"}` aberto. Privado exige senha na requisição.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-md bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setSettings((prev: any) => ({ ...prev, accessMode: "public" }))}
                    className={`h-10 rounded-md text-sm font-semibold transition ${
                      settings.accessMode !== "password"
                        ? "bg-white text-slate-950 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Público
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettings((prev: any) => ({ ...prev, accessMode: "password" }))}
                    className={`inline-flex h-10 items-center justify-center gap-2 rounded-md text-sm font-semibold transition ${
                      settings.accessMode === "password"
                        ? "bg-white text-slate-950 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <KeyRound className="h-4 w-4" />
                    Privado
                  </button>
                </div>

                {settings.accessMode === "password" ? (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Senha do endpoint</label>
                    <div className="grid gap-2 smi:grid-cols-[1fr_auto]">
                      <input
                        type="text"
                        value={settings.accessPassword}
                        onChange={(event) => setSettings((prev: any) => ({ ...prev, accessPassword: event.target.value }))}
                        placeholder="Defina uma senha forte"
                        className="h-11 w-full rounded-md border border-slate-200 px-3 font-mono text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                      <HeroButton
                        type="button"
                        variant="flat"
                        className="h-11 w-full justify-center whitespace-nowrap smi:w-36"
                        onClick={generateSecurePassword}
                      >
                        <Dices className="h-4 w-4" />
                        Randomizar
                      </HeroButton>
                    </div>
                    <p className="text-xs leading-5 text-slate-500">
                      Envie a senha no header `x-endpoint-password`.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="rounded-md border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">Valores fixos</p>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Indica que este endpoint pode manter respostas cacheadas por um tempo definido.
                </p>
              </div>
              <Switch
                className="shrink-0"
                checked={settings.fixedValuesEnabled}
                onCheckedChange={(checked: any) => setSettings((prev: any) => ({ ...prev, fixedValuesEnabled: checked }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Clock className="h-4 w-4 text-blue-600" />
              TTL do cache
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={settings.cacheTtlSeconds}
                disabled={!settings.fixedValuesEnabled}
                onChange={(event) => setSettings((prev: any) => ({ ...prev, cacheTtlSeconds: Number(event.target.value) }))}
                className="h-11 w-full min-w-0 flex-1 rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
              />
              <span className="shrink-0 text-sm font-medium text-slate-500">segundos</span>
            </div>
            <p className="text-xs leading-5 text-slate-500">
              Exemplo: `300` mantém o endpoint cacheado por 5 minutos no sistema.
            </p>
          </div>

          <div className="rounded-md border border-blue-100 bg-blue-50 p-3 smi:p-4">
            <div className="grid gap-3 mdi:grid-cols-[1fr_auto] mdi:items-center">
              <div className="min-w-0">
                <p className="font-semibold text-blue-950">Cache do endpoint</p>
                <p className="mt-1 text-sm leading-5 text-blue-800">
                  Use esta ação quando quiser forçar o sistema a considerar uma nova versão do cache.
                </p>
              </div>
              <HeroButton
                variant="flat"
                color="primary"
                className="h-11 w-full justify-center whitespace-nowrap px-4 mdi:w-44"
                onClick={onRefreshCache}
                isLoading={loading}
              >
                <RefreshCw className="h-4 w-4 shrink-0" />
                <span>Atualizar cache</span>
              </HeroButton>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <HeroButton variant="flat" className="h-11" onClick={() => onOpenChange(false)} isDisabled={loading}>
            Cancelar
          </HeroButton>
          <HeroButton color="primary" className="h-11" onClick={onSave} isLoading={loading}>
            Salvar alterações
          </HeroButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ConfirmEndpointRenameDialog({ open, onOpenChange, currentName, nextName, loading, onConfirm }: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-24px)] smi:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Confirmar alteração do endpoint
          </DialogTitle>
          <DialogDescription>
            Renomear uma rota altera a URL pública da API e pode quebrar integrações existentes.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-900">
          <p>
            A rota atual <strong>/api/{currentName}</strong> deixará de ser o caminho principal.
          </p>
          <p className="mt-2">
            A nova rota será <strong>/api/{nextName}</strong>. Atualize clientes, frontends, webhooks e qualquer cache externo que consuma esse endpoint.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <HeroButton variant="flat" className="h-11" onClick={() => onOpenChange(false)} isDisabled={loading}>
            Cancelar
          </HeroButton>
          <HeroButton color="danger" className="h-11" onClick={onConfirm} isLoading={loading}>
            Confirmar alteração
          </HeroButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const HISTORY_ACTION_META: Record<string, { label: string; icon: any; className: string }> = {
  endpoint_created: { label: "Endpoint criado", icon: Database, className: "bg-blue-100 text-blue-700" },
  endpoint_updated: { label: "Configurações atualizadas", icon: Settings, className: "bg-slate-100 text-slate-700" },
  item_created: { label: "Item adicionado", icon: Plus, className: "bg-green-100 text-green-700" },
  item_updated: { label: "Item atualizado", icon: Save, className: "bg-amber-100 text-amber-700" },
  item_deleted: { label: "Item excluído", icon: Trash2, className: "bg-red-100 text-red-700" },
}

function toHistoryDate(value: any): Date | null {
  if (!value) return null
  if (typeof value?.toDate === "function") return value.toDate()
  const parsed = new Date(value)
  return isNaN(parsed.getTime()) ? null : parsed
}

function HistoryDialog({ open, onOpenChange, loading, entries }: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-[calc(100vw-24px)] overflow-y-auto smi:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            Histórico do endpoint
          </DialogTitle>
          <DialogDescription>
            Quem criou, editou ou adicionou dados neste endpoint.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex min-h-40 items-center justify-center">
            <span className="loader h-10 w-10 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
          </div>
        ) : !entries || entries.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            Nenhum registro de histórico ainda.
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry: any) => {
              const meta = HISTORY_ACTION_META[entry.action] || { label: entry.action, icon: Clock, className: "bg-slate-100 text-slate-700" }
              const Icon = meta.icon
              const date = toHistoryDate(entry.createdAt)
              return (
                <div key={entry.id} className="flex items-start gap-3 rounded-md border border-slate-200 p-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${meta.className}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{entry.summary || meta.label}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {entry.actor?.email || "desconhecido"}
                      {date ? ` · ${date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}` : ""}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <DialogFooter>
          <HeroButton variant="flat" className="h-11" onClick={() => onOpenChange(false)}>
            Fechar
          </HeroButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
