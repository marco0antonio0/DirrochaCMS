import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { User } from "@/backend/user/user.service";

export function ItemUser({ name = "", email = "", onDelete }: { name: string; email: string; onDelete: (email: string) => void }) {
    const [loading, setLoading] = useState(false);
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
  
    async function handleDelete() {
      setLoading(true);
      toast("Deletando conta ...", { duration: 4000 });
  
      let response = await User.deleteUser(email);
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
        <div className="flex w-full flex-col gap-4 rounded-lg border-2 border-gray-200 bg-white px-4 py-5 shadow-sm smi:flex-row smi:items-center smi:justify-between smi:px-5 smi:py-7">
          {!loading ? (
            <>
              <div className="min-w-0 space-y-1">
                <h1 className="text-sm font-medium text-slate-500">Credenciais</h1>
                <h1 className="truncate text-sm text-slate-900">Nome: {name ?? "Lorem ipsum dollor"}</h1>
                <h1 className="truncate text-sm text-slate-900">Email: {email ?? "Lorem ipsum dollor"}</h1>
                <h1 className="text-sm text-slate-900">Senha: criptografado</h1>
              </div>
            
          <button type="button" className="flex h-11 w-full items-center justify-center rounded-md text-red-500 transition hover:bg-red-50 smi:w-11" onClick={onOpen} aria-label="Excluir usuário">
            <svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px" fill="currentColor">
              <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
            </svg>
          </button>
          </>
          ) : (
            <>
            <span className="loader h-6 w-6 animate-spin rounded-full border-4 border-black border-t-transparent"></span>
            <h1 className="text-sm font-medium">Deletando ...</h1>
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
