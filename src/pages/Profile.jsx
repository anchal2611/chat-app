import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { auth, db } from "../firebase/firebaseConfig";

import {
doc,
getDoc,
updateDoc,
arrayRemove
} from "firebase/firestore";

import { signOut } from "firebase/auth";

export default function Profile(){

const navigate = useNavigate();

const [userData,setUserData] = useState(null);
const [blockedUsers,setBlockedUsers] = useState([]);

const avatars = [
"/avatars/1.png",
"/avatars/2.png",
"/avatars/3.png",
"/avatars/4.png"
];



/* LOAD USER PROFILE */

useEffect(()=>{

const loadUser = async ()=>{

const user = auth.currentUser;

if(!user) return;

const userSnap = await getDoc(doc(db,"users",user.uid));

if(userSnap.exists()){

const data = userSnap.data();

setUserData(data);

loadBlockedUsers(data.blockedUsers || []);

}

};

loadUser();

},[]);



/* LOAD BLOCKED USERS */

const loadBlockedUsers = async (blockedIds)=>{

if(!blockedIds || blockedIds.length===0){
setBlockedUsers([]);
return;
}

const users=[];

for(const uid of blockedIds){

const snap = await getDoc(doc(db,"users",uid));

if(snap.exists()){
users.push(snap.data());
}

}

setBlockedUsers(users);

};



/* CHANGE AVATAR */

const changeAvatar = async (avatar)=>{

await updateDoc(
doc(db,"users",auth.currentUser.uid),
{ avatar }
);

setUserData({
...userData,
avatar
});

};



/* UNBLOCK USER */

const unblockUser = async (uid)=>{

await updateDoc(
doc(db,"users",auth.currentUser.uid),
{
blockedUsers: arrayRemove(uid)
}
);

setBlockedUsers(
blockedUsers.filter(u=>u.uid !== uid)
);

};



/* LOGOUT */

const logout = async ()=>{

await signOut(auth);

navigate("/auth");

};



if(!userData){

return(

<div className="flex items-center justify-center min-h-screen text-gray-400">

Loading profile...

</div>

);

}



return(

<div className="min-h-screen flex items-center justify-center px-6">

<div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-2xl w-[420px] text-center">



{/* BACK BUTTON */}

<button
onClick={()=>navigate(-1)}
className="absolute left-4 top-4 bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20"
>
← Back
</button>



{/* AVATAR */}

<img
src={userData.avatar || "/avatars/1.png"}
className="w-28 h-28 rounded-full mx-auto mb-6 object-cover"
/>



<h2 className="text-2xl font-semibold mb-1">
{userData.name}
</h2>

<p className="text-gray-400 mb-6">
{userData.email}
</p>



{/* USER DETAILS */}

<div className="text-left space-y-2 text-sm mb-6">

<div>
<span className="text-gray-400">Gender:</span>{" "}
{userData.gender || "Not set"}
</div>

<div>
<span className="text-gray-400">Date of Birth:</span>{" "}
{userData.dob || "Not set"}
</div>

</div>



{/* CHANGE AVATAR */}

<p className="text-gray-400 text-sm mb-3">
Change Profile Picture
</p>

<div className="flex justify-center gap-3 mb-8">

{avatars.map((a,i)=>(
<img
key={i}
src={a}
onClick={()=>changeAvatar(a)}
className={`w-12 h-12 rounded-full cursor-pointer border transition
${userData.avatar===a
? "border-purple-500 scale-110"
: "border-transparent hover:border-purple-400"
}`}
 />
))}

</div>



{/* BLOCKED USERS */}

<div className="text-left">

<h3 className="text-lg font-semibold mb-4">
Blocked Users
</h3>

{blockedUsers.length===0 ? (

<p className="text-gray-400 text-sm">
No blocked users
</p>

):( 

<div className="space-y-3">

{blockedUsers.map((u)=>(
<div
key={u.uid}
className="flex items-center justify-between bg-white/5 p-3 rounded-lg"
>

<div className="flex items-center gap-3">

<img
src={u.avatar || "/avatars/1.png"}
className="w-10 h-10 rounded-full"
/>

<div className="text-sm">
<div>{u.name}</div>
<div className="text-gray-400 text-xs">
{u.email}
</div>
</div>

</div>

<button
onClick={()=>unblockUser(u.uid)}
className="text-red-400 text-sm hover:underline"
>
Unblock
</button>

</div>
))}

</div>

)}

</div>



{/* LOGOUT */}

<button
onClick={logout}
className="bg-red-500 px-6 py-2 rounded-lg w-full mt-8 hover:bg-red-600"
>
Logout
</button>



</div>

</div>

);

}
