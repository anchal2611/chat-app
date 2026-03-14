import { useState } from "react";

import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

export default function ChatDashboard(){

const [selectedChat,setSelectedChat] = useState(null);

return(

<div className="h-screen flex">

<Sidebar setSelectedChat={setSelectedChat} />

<ChatWindow selectedChat={selectedChat} />

</div>

);

}