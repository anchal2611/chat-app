import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { auth } from "../firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Navbar() {

const navigate = useNavigate();

const [user,setUser] = useState(null);

useEffect(()=>{

const unsub = onAuthStateChanged(auth,(u)=>{
setUser(u);
});

return ()=>unsub();

},[]);


const logout = async()=>{

await signOut(auth);

navigate("/auth");

};


return(

<div className="fixed top-0 w-full z-50 backdrop-blur-lg bg-black/40 border-b border-white/10">

<div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

{/* Logo */}

<div
onClick={()=>navigate("/")}
className="font-bold text-xl cursor-pointer"
>
ChatterBox
</div>


{/* Navigation */}

<div className="flex items-center gap-6 text-sm">

<button
onClick={()=>navigate("/")}
className="hover:text-purple-400"
>
Home
</button>


{user && (

<button
onClick={()=>navigate("/chat")}
className="hover:text-purple-400"
>
Chat
</button>

)}


{user && (

<button
onClick={()=>navigate("/profile")}
className="hover:text-purple-400"
>
Profile
</button>

)}


{!user ? (

<button
onClick={()=>navigate("/auth")}
className="bg-purple-500 px-4 py-2 rounded-lg"
>
Login
</button>

) : (

<button
onClick={logout}
className="text-red-400"
>
Logout
</button>

)}

</div>

</div>

</div>

);

}
