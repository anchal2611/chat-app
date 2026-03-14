export default function ChatHeader(){

return(

<div className="h-16 border-b border-white/10 flex items-center px-6 gap-3">

  <img
  src="/avatars/2.png"
  className="w-10 h-10 rounded-full cursor-pointer"
  />

  <div className="font-medium">
    Friend Name
  </div>

</div>

);

}