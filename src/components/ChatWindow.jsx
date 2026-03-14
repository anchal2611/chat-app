import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { auth, db } from "../firebase/firebaseConfig";

import {
collection,
addDoc,
serverTimestamp,
query,
orderBy,
onSnapshot,
doc,
updateDoc,
deleteDoc,
getDocs,
getDoc
} from "firebase/firestore";

import MessageInput from "./MessageInput";

export default function ChatWindow({ selectedChat }) {

const navigate = useNavigate();

const [messages, setMessages] = useState([]);
const [text, setText] = useState("");
const [image, setImage] = useState(null);
const [audio, setAudio] = useState(null);
const [blocked, setBlocked] = useState(false);

const bottomRef = useRef(null);



/* LOAD MESSAGES */

useEffect(() => {

if (!selectedChat) return;

const q = query(
collection(db,"chats",selectedChat.id,"messages"),
orderBy("createdAt")
);

const unsubscribe = onSnapshot(q,(snapshot)=>{

const msgs = snapshot.docs.map(doc=>({
id:doc.id,
...doc.data()
}));

setMessages(msgs);

});

return ()=>unsubscribe();

},[selectedChat]);



/* CHECK BLOCK STATUS */

useEffect(()=>{

const checkBlock = async()=>{

if(!selectedChat) return;

const userDoc = await getDoc(
doc(db,"users",auth.currentUser.uid)
);

const blockedUsers = userDoc.data()?.blockedUsers || [];

setBlocked(blockedUsers.includes(selectedChat.friend.uid));

};

checkBlock();

},[selectedChat]);



/* AUTO SCROLL */

useEffect(()=>{
bottomRef.current?.scrollIntoView({behavior:"smooth"});
},[messages]);



/* SEND MESSAGE */

const sendMessage = async ()=>{

if(blocked){
alert("You blocked this user");
return;
}

if(!text.trim() && !image && !audio) return;

await addDoc(
collection(db,"chats",selectedChat.id,"messages"),
{
senderId:auth.currentUser.uid,
text:text || "",
image:image || null,
audio:audio || null,
createdAt:serverTimestamp()
}
);

await updateDoc(doc(db,"chats",selectedChat.id),{
lastMessage:
audio ? "🎤 Voice message"
: image ? "📷 Image"
: text
});

setText("");
setImage(null);
setAudio(null);

};



/* DELETE MESSAGE */

const deleteMessage = async (messageId)=>{

await deleteDoc(
doc(db,"chats",selectedChat.id,"messages",messageId)
);

};



/* DELETE CHAT */

const deleteChat = async ()=>{

const confirmDelete = confirm("Delete this chat?");

if(!confirmDelete) return;

const messagesRef = collection(db,"chats",selectedChat.id,"messages");

const snapshot = await getDocs(messagesRef);

snapshot.forEach(async (msg)=>{
await deleteDoc(msg.ref);
});

await deleteDoc(doc(db,"chats",selectedChat.id));

window.location.reload();

};



/* NO CHAT SELECTED */

if(!selectedChat){

return(

<div className="flex-1 flex items-center justify-center text-gray-400">
Select a chat to start messaging
</div>

);

}



/* MAIN CHAT WINDOW */

return(

<div className="flex-1 flex flex-col">

{/* HEADER */}

<div className="h-16 border-b border-white/10 flex items-center justify-between px-6">

<div className="flex items-center gap-3">

<img
src={selectedChat.friend?.avatar || "/avatars/1.png"}
className="w-10 h-10 rounded-full object-cover cursor-pointer"
onClick={()=>navigate(`/profile/${selectedChat.friend.uid}`,{
state:{friend:selectedChat.friend}
})}
/>

<div className="font-medium">
{selectedChat.friend?.name}
</div>

</div>

<button
onClick={deleteChat}
className="text-red-400 text-sm hover:underline"
>
Delete Chat
</button>

</div>



{/* MESSAGES */}

<div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">

{messages.map(m=>{

const isMe = m.senderId === auth.currentUser.uid;

const time = m.createdAt?.toDate
? m.createdAt.toDate().toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
})
: "";

return(

<div
key={m.id}
className={`flex ${isMe ? "justify-end":"justify-start"}`}
>

<div
className={`relative group max-w-xs px-4 py-2 rounded-2xl shadow
${isMe
? "bg-purple-500 text-white rounded-br-none"
: "bg-white/10 text-white rounded-bl-none"}`}
>

{m.image && (
<img
src={m.image}
className="rounded-lg mb-2 max-w-[200px]"
/>
)}

{m.audio && (
<audio
controls
src={m.audio}
className="mt-2"
/>
)}

{m.text && <div>{m.text}</div>}

<div className="text-xs opacity-60 mt-1 text-right">
{time}
</div>

{isMe && (
<button
onClick={()=>deleteMessage(m.id)}
className="absolute -top-2 -right-2 hidden group-hover:block text-xs bg-red-500 px-2 py-1 rounded"
>
Delete
</button>
)}

</div>

</div>

);

})}

<div ref={bottomRef}></div>

</div>



{/* INPUT */}

{blocked ? (

<div className="h-16 flex items-center justify-center border-t border-white/10 text-red-400">
You blocked this user
</div>

) : (

<MessageInput
text={text}
setText={setText}
sendMessage={sendMessage}
setImage={setImage}
setAudio={setAudio}
/>

)}

</div>

);

}
