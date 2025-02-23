import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { User } from "@/services/user/user";

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