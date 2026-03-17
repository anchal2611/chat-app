import { useState, useEffect } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";


export default function ChatDashboard(){

const [selectedChat,setSelectedChat] = useState(null);


useEffect(() => {

  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "users", user.uid);

  // SET ONLINE
  updateDoc(userRef, {
    isOnline: true
  });

  // SET OFFLINE on tab close
  const handleOffline = async () => {
    await updateDoc(userRef, {
      isOnline: false,
      lastSeen: serverTimestamp()
    });
  };

  window.addEventListener("beforeunload", handleOffline);

  return () => {
    handleOffline();
    window.removeEventListener("beforeunload", handleOffline);
  };

}, []);

return(

<div className="h-screen flex">

<Sidebar setSelectedChat={setSelectedChat} />

<ChatWindow selectedChat={selectedChat} />

</div>

);

}