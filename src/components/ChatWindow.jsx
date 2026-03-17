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
  getDoc,
  increment
} from "firebase/firestore";

import MessageInput from "./MessageInput";

export default function ChatWindow({ selectedChat }) {

  const navigate = useNavigate();

  const [messages,setMessages] = useState([]);
  const [text,setText] = useState("");
  const [image,setImage] = useState(null);
  const [audio,setAudio] = useState(null);
  const [blocked,setBlocked] = useState(false);
  const [typing,setTyping] = useState(false);
  const [reply, setReply] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [friendData, setFriendData] = useState(null);

  const bottomRef = useRef(null);

  useEffect(() => {
    if (!selectedChat?.friend?.uid) return;
    const unsub = onSnapshot(
      doc(db, "users", selectedChat.friend.uid),
      (snap) => {
        setFriendData(snap.data());
      }
    );
    
    return () => unsub();
  }, [selectedChat]);

  useEffect(() => {
    if (!selectedChat) return;
    
    const unsub = onSnapshot(
      doc(db,"chats",selectedChat.id),
      (snap) => {
        setChatData(snap.data());
      }
    );
    
    return () => unsub();
  }, [selectedChat]);

  useEffect(() => {
    if (!selectedChat) return;
    
    const unsub = onSnapshot(
      doc(db, "chats", selectedChat.id),
      (snap) => {
        const data = snap.data();
        const friendId = selectedChat.friend?.uid;
        const isTyping = data?.typing?.[friendId];
        setTyping(isTyping || false);
      });
      
      return () => unsub();
    }, [selectedChat]);


  /* LOAD MESSAGES */

  useEffect(()=>{

    if(!selectedChat) return;

    const loadMessages = async () => {

      try{

        /* RESET UNREAD COUNT */

        if(auth.currentUser){

          await updateDoc(
            doc(db,"chats",selectedChat.id),
            {
              [`unread.${auth.currentUser.uid}`]:0
            }
          );

        }

      }catch(err){
        console.log("Unread reset error:",err);
      }

    };

    loadMessages();

    const q = query(
      collection(db,"chats",selectedChat.id,"messages"),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(q,(snapshot)=>{

      const msgs = snapshot.docs.map(doc=>({
        id:doc.id,
        ...doc.data()
      }));

      msgs.forEach(async (m) => {
        if (
          m.senderId !== auth.currentUser.uid &&
          !(m.seenBy || []).includes(auth.currentUser.uid)
        ) {
          
          await updateDoc(
            doc(db,"chats",selectedChat.id,"messages",m.id),
            {
              seenBy: [...(m.seenBy || []), auth.currentUser.uid]
            }
          );
        }
      });

      setMessages(msgs);

    });

    return ()=>unsubscribe();

  },[selectedChat]);


  /* CHECK BLOCK STATUS */

  useEffect(()=>{
    
    const checkBlock = async()=>{
      
      if(!selectedChat || !auth.currentUser) return;
      
      const myDoc = await getDoc(doc(db,"users",auth.currentUser.uid));
      const friendDoc = await getDoc(doc(db,"users",selectedChat.friend.uid));
      
      const myBlocked = myDoc.data()?.blockedUsers || [];
      const friendBlocked = friendDoc.data()?.blockedUsers || [];
      
      if(
        myBlocked.includes(selectedChat.friend.uid) || friendBlocked.includes(auth.currentUser.uid)
      ){
        setBlocked(true);
      }else{
        setBlocked(false);
      }
    };
    
    checkBlock();
  
  },[selectedChat]);


  /* AUTO SCROLL */

  useEffect(()=>{

    bottomRef.current?.scrollIntoView({behavior:"smooth"});

  },[messages]);

  const toggleReaction = async (message) => {
    const userId = auth.currentUser.uid;
    
    const messageRef = doc(
      db,
      "chats",
      selectedChat.id,
      "messages",
      message.id
    );
    
    const reactions = message.reactions || {};
    const emoji = "❤️"; // default for now (we'll upgrade later)

    let updated = { ...reactions };
    
    if (updated[emoji]?.includes(userId)) {
      // remove reaction
      updated[emoji] = updated[emoji].filter(id => id !== userId);
      
      if (updated[emoji].length === 0) {
        delete updated[emoji];
      }
    } else {
      // add reaction
      if (!updated[emoji]) updated[emoji] = [];
      updated[emoji].push(userId);
    }
    
    await updateDoc(messageRef, {
      reactions: updated
    });
  };


  /* SEND MESSAGE */

  const sendMessage = async()=>{

    if(!selectedChat || !auth.currentUser) return;

    if(blocked){
      alert("You blocked this user");
      return;
    }

    if(!text.trim() && !image && !audio) return;

    try{

      await addDoc(
        collection(db,"chats",selectedChat.id,"messages"),
        {
          senderId:auth.currentUser.uid,
          text:text || "",
          image:image || null,
          audio:audio || null,
          
          replyTo: reply
          ? {
            text: reply.text || null,
            senderId: reply.senderId
          }
          : null,

          seenBy: [],
          
          createdAt:serverTimestamp()
        }
      );

      await updateDoc(
        doc(db,"chats",selectedChat.id),
        {
          lastMessage:
            audio ? "🎤 Voice message"
            : image ? "📷 Image"
            : text || "",

          lastMessageSender:auth.currentUser.uid,

          lastUpdated:serverTimestamp(),

          [`unread.${selectedChat.friend.uid}`]:increment(1)
        }
      );

      setText("");
      setImage(null);
      setAudio(null);
      setReply(null);

    }catch(err){

      console.log(err);

    }

  };


  /* DELETE MESSAGE */

  const deleteMessage = async(messageId)=>{

    if(!selectedChat) return;

    try{

      await deleteDoc(
        doc(db,"chats",selectedChat.id,"messages",messageId)
      );

    }catch(err){
      console.log(err);
    }

  };


  /* DELETE CHAT */

  const deleteChat = async()=>{

    if(!selectedChat) return;

    const confirmDelete = window.confirm("Delete this chat?");
    if(!confirmDelete) return;

    try{

      const messagesRef = collection(db,"chats",selectedChat.id,"messages");

      const snapshot = await getDocs(messagesRef);

      snapshot.forEach(async(msg)=>{
        await deleteDoc(msg.ref);
      });

      await deleteDoc(doc(db,"chats",selectedChat.id));

      window.location.reload();

    }catch(err){
      console.log(err);
    }

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

          <div>
            <div className="font-medium">
              {(friendData || selectedChat.friend)?.name}
            </div>
            
            <div className="text-xs text-gray-400">
              {(friendData || selectedChat.friend)?.isOnline
              ? "Online"
              : (friendData || selectedChat.friend)?.lastSeen
              ? `Last seen ${new Date(
                (friendData || selectedChat.friend).lastSeen.seconds * 1000
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              })}`
              : "Offline"
              }
            </div>
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

          const isMe = m.senderId === auth.currentUser?.uid;

          const time = m.createdAt?.toDate
            ? m.createdAt.toDate().toLocaleTimeString([],{
              hour:"2-digit",
              minute:"2-digit"
            })
            : "";

          return(

            <div
            key={m.id}
            onClick={() => setReply(m)}
            className={`flex cursor-pointer ${isMe ? "justify-end":"justify-start"}`}
            >

              <div
                onDoubleClick={() => toggleReaction(m)}
                className={`relative group max-w-xs px-4 py-2 rounded-2xl shadow
                ${isMe
                  ? "bg-purple-500 text-white rounded-br-none"
                  : "bg-white/10 text-white rounded-bl-none"
                }`}
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

                {m.replyTo && (
                  <div className="mb-2 p-2 rounded bg-white/10 text-xs border-l-2 border-purple-400">
                    
                    <div className="text-purple-400 font-medium">
                      {m.replyTo.senderId === auth.currentUser.uid ? "You" : selectedChat.friend.name}
                    </div>

                    <div className="text-gray-300">
                      {m.replyTo.text || "Message"}
                    </div>

                  </div>
                )}

                {m.text && <div>{m.text}</div>}

                {m.reactions && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {Object.entries(m.reactions).map(([emoji, users]) => (
                      <div
                      key={emoji}
                      className="bg-white/10 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                      >
                        <span>{emoji}</span>
                        <span>{users.length}</span>
                        </div>
                      ))}
                      </div>
                    )}

                <div className="text-xs opacity-60 mt-1 text-right flex items-center justify-end gap-1">
                  
                  {time}
                  
                  {isMe && (
                    <span className={
                      m.seenBy?.includes(selectedChat.friend.uid)
                      ? "text-blue-400"
                      : ""
                      }>
                        {m.seenBy?.includes(selectedChat.friend.uid) ? "✓✓" : "✓"}
                        </span>
                      )}
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

      {reply && (
        <div className="px-4 py-2 bg-white/10 border-t border-white/10 flex justify-between items-center">
          
          <div className="text-sm">
            <div className="text-purple-400 font-medium">
              Replying to {reply.senderId === auth.currentUser.uid ? "You" : selectedChat.friend.name}
            </div>
            <div className="text-gray-400 text-xs truncate max-w-xs">
              {reply.text || (reply.image ? "📷 Image" : "🎤 Voice")}
            </div>
          </div>
          
          <button
          onClick={() => setReply(null)}
          className="text-red-400 text-sm"
        >
        ✕
        </button>

        </div>
      )}

      {typing && selectedChat?.friend &&(
        <div className="px-6 pb-2 text-sm text-gray-400 flex items-center gap-2">
          <span>{selectedChat.friend?.name}</span>
          
          <div className="flex gap-1">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
          
        </div>
      )}


      {/* INPUT */}

      {blocked ? (

        <div className="h-16 flex items-center justify-center border-t border-white/10 text-red-400">
          {blocked ? "Messaging disabled" : ""}
        </div>

      ) : (

        <MessageInput
          text={text}
          setText={setText}
          sendMessage={sendMessage}
          setImage={setImage}
          setAudio={setAudio}
          selectedChat={selectedChat}
        />

      )}


    </div>

    

  );

}