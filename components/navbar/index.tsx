export default function Navbar({onClick,Icon,text,Component=null}:{onClick:any,Icon:any,text:any,Component:any}){
    return <>
        <div className="relative m-auto mt-0 bg-[#FFFFFF] w-[100%] h-[40%] rounded-t-2xl shadow-sm flex flex-col sm:h-[30%] py-8">
        <button className="absolute left-10 top-10 md:top-6 p-2 rounded-full hover:bg-gray-200 transition" onClick={() => {onClick()}}>
          <Icon/>
        </button>
        <h1 className="m-auto mb-0 text-3xl font-semibold sm:text-2xl">DIRROCHA CMS</h1>
        {Component?<Component/>:<span className="m-auto mt-3 text-lg opacity-65 sm:text-sm sm:mt-0 text-center px-20">{text}</span>}
      </div>
    </>
  }