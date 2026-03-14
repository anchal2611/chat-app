import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { auth, db } from "../firebase/firebaseConfig";




import {
doc,
getDoc,
updateDoc,
arrayUnion,
arrayRemove
} from "firebase/firestore";

export default function UserProfile(){

const location = useLocation();
const friend = location.state?.friend;
const navigate = useNavigate();


const [blocked,setBlocked] = useState(false);

useEffect(()=>{

const checkBlock = async ()=>{

const userDoc = await getDoc(
doc(db,"users",auth.currentUser.uid)
);

const blockedUsers = userDoc.data()?.blockedUsers || [];

setBlocked(blockedUsers.includes(friend.uid));

};

checkBlock();

},[friend.uid]);


const blockUser = async ()=>{

await updateDoc(
doc(db,"users",auth.currentUser.uid),
{
blockedUsers: arrayUnion(friend.uid)
}
);

setBlocked(true);

};


const unblockUser = async ()=>{

await updateDoc(
doc(db,"users",auth.currentUser.uid),
{
blockedUsers: arrayRemove(friend.uid)
}
);

setBlocked(false);

};


return(

<div className="relative flex items-center justify-center min-h-screen">

<button
onClick={() => navigate(-1)}
className="absolute top-6 left-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm"
>
← Back
</button>


<div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-2xl w-96 text-center">

<img
src={friend.avatar || "/avatars/1.png"}
className="w-28 h-28 rounded-full mx-auto mb-6 object-cover"
/>

<h2 className="text-2xl font-semibold mb-2">
{friend.name}
</h2>

<p className="text-gray-400 mb-6">
{friend.email}
</p>


{blocked ? (

<button
onClick={unblockUser}
className="bg-green-500 px-6 py-2 rounded-lg"
>

Unblock User

</button>

) : (

<button
onClick={blockUser}
className="bg-red-500 px-6 py-2 rounded-lg"
>

Block User

</button>

)}


</div>

</div>

);

}