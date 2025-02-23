import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownSection,
    DropdownItem,
    Button,
    User,
    cn,
  } from "@heroui/react";
import { useRouter } from "next/router";
  
  export const DeleteDocumentIcon = (props:any) => {
    return (
      <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        height="1em"
        role="presentation"
        viewBox="0 0 24 24"
        width="1em"
        {...props}
      >
        <path
          d="M21.07 5.23c-1.61-.16-3.22-.28-4.84-.37v-.01l-.22-1.3c-.15-.92-.37-2.3-2.71-2.3h-2.62c-2.33 0-2.55 1.32-2.71 2.29l-.21 1.28c-.93.06-1.86.12-2.79.21l-2.04.2c-.42.04-.72.41-.68.82.04.41.4.71.82.67l2.04-.2c5.24-.52 10.52-.32 15.82.21h.08c.38 0 .71-.29.75-.68a.766.766 0 0 0-.69-.82Z"
          fill="currentColor"
        />
        <path
          d="M19.23 8.14c-.24-.25-.57-.39-.91-.39H5.68c-.34 0-.68.14-.91.39-.23.25-.36.59-.34.94l.62 10.26c.11 1.52.25 3.42 3.74 3.42h6.42c3.49 0 3.63-1.89 3.74-3.42l.62-10.25c.02-.36-.11-.7-.34-.95Z"
          fill="currentColor"
          opacity={0.399}
        />
        <path
          clipRule="evenodd"
          d="M9.58 17a.75.75 0 0 1 .75-.75h3.33a.75.75 0 0 1 0 1.5h-3.33a.75.75 0 0 1-.75-.75ZM8.75 13a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1-.75-.75Z"
          fill="currentColor"
          fillRule="evenodd"
        />
      </svg>
    );
  };

  export const PlusIcon = (props:any) => {
    return (
      <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        height="1em"
        role="presentation"
        viewBox="0 0 24 24"
        width="1em"
        {...props}
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
        >
          <path d="M6 12h12" />
          <path d="M12 18V6" />
        </g>
      </svg>
    );
  };
  
  export default function ButtonDropdown({actiondelet,addItem,isItem}:any) {
    const iconClasses = "text-xl text-default-500 pointer-events-none flex-shrink-0";
    const r = useRouter()
    return (
      <Dropdown
        showArrow
        classNames={{
          base: "before:bg-default-200", // change arrow background
          content: "p-0 border-small border-divider bg-background",
        }}
        radius="sm"
      >
        <DropdownTrigger>
        <Button className={`bg-transparent right-6 top-10 md:top-6 p-2 rounded-full hover:bg-gray-200 transition ${true?"absolute":"hidden"}`} onClick={async () => {
        // setOpenModal(true)
        }}>
            <svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="30px" fill="#171717">
            <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg>
        </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Custom item styles"
          className="p-3"
          disabledKeys={["profile"]}
          itemClasses={{
            base: [
              "rounded-md",
              "text-default-500",
              "transition-opacity",
              "data-[hover=true]:text-foreground",
              "data-[hover=true]:bg-default-100",
              "dark:data-[hover=true]:bg-default-50",
              "data-[selectable=true]:focus:bg-default-50",
              "data-[pressed=true]:opacity-70",
              "data-[focus-visible=true]:ring-default-500",
            ],
          }}
        >
          <DropdownSection showDivider aria-label="Profile & Actions">
            <DropdownItem key="profile" isReadOnly className="h-14 gap-2 opacity-100">
            <p className="font-semibold">Dirrocha</p>
            <p className="font-semibold">CMS @Version Beta</p>
            </DropdownItem>
            <DropdownItem key="homePage"
            onClick={()=>{r.push("/home")}}
            >Pagina inicial</DropdownItem>
            {isItem?null:<DropdownItem key="new_project"
            onClick={()=>{addItem()}}
            endContent={<PlusIcon className="text-large" 
             onClick={()=>{addItem()}}/>}>
              Adicionar dados
            </DropdownItem>}
          </DropdownSection>
  
          {true || isItem?null:<DropdownSection showDivider aria-label="Preferences">
            <DropdownItem
              key="theme"
              isReadOnly
              className="cursor-default"
              endContent={
                <select
                  className="z-10 outline-none w-24 h-10 pl-2 py-0.5 rounded-md text-tiny group-data-[hover=true]:border-default-500 border-small border-default-300 dark:border-default-200 bg-transparent text-default-500"
                  id="theme"
                  name="theme"
                >
                  <option>publico</option>
                  <option>privado</option>
                </select>
              }
            >
              Visibilidade
            </DropdownItem>
          </DropdownSection>}
          <DropdownSection title="Danger zone">
          <DropdownItem
            onClick={()=>{actiondelet()}}
            key="delete"
            className="text-danger"
            color="danger"
            description={isItem?"Permanently delete the item":"Permanently delete the endpoint"}
            startContent={<DeleteDocumentIcon className={cn(iconClasses, "text-danger")} />}
          >
            Delete 
          </DropdownItem>
        </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    );
  }
  