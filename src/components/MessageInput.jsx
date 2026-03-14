import { Paperclip, Mic, Smile } from "lucide-react";
import { useRef, useState } from "react";

import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

export default function MessageInput({
  text,
  setText,
  sendMessage,
  setImage,
  setAudio,
  selectedChat
}) {

const fileRef = useRef();
const mediaRecorderRef = useRef();

const [showEmoji,setShowEmoji] = useState(false);
const [recording,setRecording] = useState(false);

const chunksRef = useRef([]);


// IMAGE UPLOAD
const handleImage = (e)=>{

const file = e.target.files[0];
if(!file) return;

const reader = new FileReader();

reader.onloadend = ()=>{
setImage(reader.result);
};

reader.readAsDataURL(file);

};


// VOICE RECORD START
const startRecording = async ()=>{

const stream = await navigator.mediaDevices.getUserMedia({audio:true});

const mediaRecorder = new MediaRecorder(stream);

mediaRecorderRef.current = mediaRecorder;

chunksRef.current = [];

mediaRecorder.ondataavailable = (e)=>{
chunksRef.current.push(e.data);
};

mediaRecorder.onstop = ()=>{

const blob = new Blob(chunksRef.current,{type:"audio/webm"});

const reader = new FileReader();

reader.onloadend = ()=>{
setAudio(reader.result);
};

reader.readAsDataURL(blob);

};

mediaRecorder.start();
setRecording(true);

};


// VOICE RECORD STOP
const stopRecording = ()=>{

if(mediaRecorderRef.current){
mediaRecorderRef.current.stop();
}

setRecording(false);

};


// TYPING DETECTION
const handleTyping = async (value)=>{

setText(value);

if(!selectedChat) return;

await updateDoc(
doc(db,"chats",selectedChat.id),
{
[`typing.${auth.currentUser.uid}`]: true
}
);

};


// ENTER KEY SEND
const handleKey = (e)=>{

if(e.key==="Enter"){
sendMessage();
}

};


return(

<div className="relative">

{/* EMOJI PICKER */}

{showEmoji && (
<div className="absolute bottom-16 left-20 z-50">
<Picker
data={data}
onEmojiSelect={(emoji)=>setText(prev => prev + emoji.native)}
theme="dark"
/>
</div>
)}

<div className="h-16 border-t border-white/10 flex items-center px-4 gap-4">

{/* FILE INPUT */}

<input
type="file"
accept="image/*"
ref={fileRef}
onChange={handleImage}
className="hidden"
/>

<Paperclip
className="cursor-pointer"
onClick={()=>fileRef.current.click()}
/>


{/* MESSAGE INPUT */}

<input
value={text}
onChange={(e)=>handleTyping(e.target.value)}
onKeyDown={handleKey}
className="flex-1 bg-white/5 rounded px-4 py-2 outline-none"
placeholder="Type a message..."
/>


{/* EMOJI BUTTON */}

<Smile
className="cursor-pointer"
onClick={()=>setShowEmoji(!showEmoji)}
/>


{/* VOICE RECORD */}

<Mic
className={`cursor-pointer ${recording ? "text-red-500":""}`}
onMouseDown={startRecording}
onMouseUp={stopRecording}
/>


{/* SEND BUTTON */}

<button
onClick={sendMessage}
className="bg-purple-500 px-4 py-2 rounded-lg"
>
Send
</button>

</div>

</div>

);
}