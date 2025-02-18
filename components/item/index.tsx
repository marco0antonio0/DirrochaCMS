export function Item({text="",onClick}:{text:any,onClick: any}){
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