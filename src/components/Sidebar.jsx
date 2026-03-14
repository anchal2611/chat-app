import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { auth, db } from "../firebase/firebaseConfig";

import { doc, getDoc } from "firebase/firestore";

import AddFriend from "./AddFriend";
import ChatList from "./ChatList";

export default function Sidebar({ setSelectedChat }) {

const navigate = useNavigate();

const [userData,setUserData] = useState(null);

useEffect(()=>{

const loadUser = async ()=>{

const user = auth.currentUser;

if(!user) return;

const docRef = doc(db,"users",user.uid);

const snap = await getDoc(docRef);

if(snap.exists()){
setUserData(snap.data());
}

};

loadUser();

},[]);

return(

<div className="w-80 bg-black/40 border-r border-white/10 p-4 flex flex-col">

{/* Profile */}

<div
className="flex items-center gap-3 cursor-pointer mb-6"
onClick={()=>navigate("/profile")}
>

<img
src={userData?.avatar || "/avatars/1.png"}
className="w-10 h-10 rounded-full object-cover"
/>

<div className="font-medium">
Hello, {userData?.name || "User"} !
</div>

</div>

{/* Add Friend */}

<AddFriend />

{/* Chat List */}

<div className="flex-1 overflow-y-auto mt-4">

<ChatList setSelectedChat={setSelectedChat} />

</div>

</div>

);

}