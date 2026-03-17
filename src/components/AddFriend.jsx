import { useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";

import {
collection,
query,
where,
getDocs,
doc,
setDoc,
getDoc,
serverTimestamp
} from "firebase/firestore";

export default function AddFriend(){

const [email,setEmail] = useState("");
const [loading,setLoading] = useState(false);

const addFriend = async () => {

if(!email.trim()) return alert("Enter an email");

try{

setLoading(true);

const currentUser = auth.currentUser;

if(!currentUser){
alert("Not logged in");
return;
}

/* FIND USER BY EMAIL */

const q = query(
collection(db,"users"),
where("email","==",email.trim())
);

const snap = await getDocs(q);

if(snap.empty){
alert("User not found");
return;
}

const friend = snap.docs[0].data();

/* PREVENT ADDING YOURSELF */

if(friend.uid === currentUser.uid){
alert("You cannot add yourself");
return;
}

/* CREATE UNIQUE CHAT ID */

const chatId =
currentUser.uid < friend.uid
? `${currentUser.uid}_${friend.uid}`
: `${friend.uid}_${currentUser.uid}`;

const chatRef = doc(db,"chats",chatId);

const chatSnap = await getDoc(chatRef);

/* CREATE CHAT IF NOT EXISTS */

if(!chatSnap.exists()){

await setDoc(chatRef,{

users:[currentUser.uid, friend.uid],

lastMessage:"",
lastMessageSender:"",

lastUpdated:serverTimestamp(),

unread:{
[currentUser.uid]:0,
[friend.uid]:0
},

/* TYPING INDICATOR FIELD */

typing:{
[currentUser.uid]:false,
[friend.uid]:false
}

});

}

setEmail("");

alert("Chat created successfully!");

}catch(err){

console.error(err);
alert(err.message);

}finally{

setLoading(false);

}

};

return(

<div className="flex gap-2 mb-4">

<input
value={email}
className="input flex-1"
placeholder="Enter friend's email"
onChange={(e)=>setEmail(e.target.value)}
/>

<button
onClick={addFriend}
disabled={loading}
className="btn-primary"
>

{loading ? "Adding..." : "Add"}

</button>

</div>

);

}