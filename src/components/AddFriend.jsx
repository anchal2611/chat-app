import { useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";

import {
collection,
query,
where,
getDocs,
doc,
setDoc,
getDoc
} from "firebase/firestore";

export default function AddFriend(){

const [email,setEmail] = useState("");

const addFriend = async () => {

try{

const q = query(
collection(db,"users"),
where("email","==",email)
);

const snap = await getDocs(q);

if(snap.empty){
alert("User not found");
return;
}

const friend = snap.docs[0].data();

const currentUser = auth.currentUser;

if(friend.uid === currentUser.uid){
alert("You cannot add yourself");
return;
}

const chatId =
currentUser.uid < friend.uid
? `${currentUser.uid}_${friend.uid}`
: `${friend.uid}_${currentUser.uid}`;

const chatRef = doc(db,"chats",chatId);

const chatSnap = await getDoc(chatRef);

if(!chatSnap.exists()){

await setDoc(chatRef,{
users:[currentUser.uid, friend.uid],
lastMessage:"",
createdAt:new Date()
});

}

alert("Chat created!");

}catch(err){
alert(err.message);
}

};

return(

<div className="flex gap-2 mb-4">

<input
className="input flex-1"
placeholder="Enter friend's email"
onChange={(e)=>setEmail(e.target.value)}
/>

<button
onClick={addFriend}
className="btn-primary"
>

Add

</button>

</div>

);

}