import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";

import {
collection,
query,
where,
onSnapshot,
doc,
getDoc
} from "firebase/firestore";

export default function ChatList({ setSelectedChat }) {

const [chats,setChats] = useState([]);

useEffect(()=>{

const q = query(
collection(db,"chats"),
where("users","array-contains",auth.currentUser.uid)
);

const unsubscribe = onSnapshot(q, async(snapshot)=>{

const chatsData = await Promise.all(

snapshot.docs.map(async(chatDoc)=>{

const chat = chatDoc.data();

const friendId = chat.users.find(
u => u !== auth.currentUser.uid
);

const friendSnap = await getDoc(doc(db,"users",friendId));

const friend = friendSnap.data();

return{
id:chatDoc.id,
friend,
lastMessage:chat.lastMessage || ""
};

})

);

setChats(chatsData);

});

return ()=>unsubscribe();

},[]);

return(

<div className="flex flex-col gap-2">

{chats.map(chat=>(

<div
key={chat.id}
onClick={()=>setSelectedChat(chat)}
className="flex gap-3 p-2 hover:bg-white/5 rounded cursor-pointer"
>

<img
src={chat.friend?.avatar || "/avatars/1.png"}
className="w-10 h-10 rounded-full object-cover"
/>

<div>

<div className="font-medium">
{chat.friend?.name}
</div>

<div className="text-sm text-gray-400">
{chat.lastMessage}
</div>

</div>

</div>

))}

</div>

);

}