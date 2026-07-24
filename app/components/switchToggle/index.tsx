import { cn, Switch } from "@heroui/react";

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