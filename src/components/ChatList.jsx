import { useEffect, useState, useRef } from "react";
import { auth, db } from "../firebase/firebaseConfig";

import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  orderBy
} from "firebase/firestore";

export default function ChatList({ setSelectedChat }) {

  const [chats, setChats] = useState([]);

  const audioRef = useRef(new Audio("/sounds/notification.mp3"));
  const prevChatsRef = useRef({}); // ✅ use object instead of array

  useEffect(() => {

    if (!auth.currentUser) return;

    const q = query(
      collection(db, "chats"),
      where("users", "array-contains", auth.currentUser.uid),
      orderBy("lastUpdated", "desc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {

      const results = [];

      for (const chatDoc of snapshot.docs) {

        const chat = chatDoc.data();

        const friendId = chat.users?.find(
          u => u !== auth.currentUser.uid
        );

        if (!friendId) continue;

        const friendSnap = await getDoc(doc(db, "users", friendId));
        const friend = friendSnap.data();

        results.push({
          id: chatDoc.id,
          friend,
          lastMessage: chat.lastMessage || "",
          unread: chat.unread || {},
          lastUpdated: chat.lastUpdated || null
        });
      }

      // 🔥 DETECT NEW MESSAGES (CORRECT WAY)
      results.forEach((chat) => {

        const prev = prevChatsRef.current[chat.id];

        if (prev && prev.lastMessage !== chat.lastMessage) {

          // 🔊 SOUND
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});

          // 🔔 NOTIFICATION
          if (Notification.permission === "granted") {
            new Notification(chat.friend?.name || "New message", {
              body: chat.lastMessage,
              icon: chat.friend?.avatar || "/avatars/1.png"
            });
          }
        }

        // update cache
        prevChatsRef.current[chat.id] = chat;

      });

      setChats(results);

    });

    return () => unsubscribe();

  }, []);

  return (

    <div className="flex flex-col gap-2">

      {chats.map((chat) => {

        const unreadCount = chat.unread?.[auth.currentUser.uid] || 0;

        const time = chat.lastUpdated?.toDate
          ? chat.lastUpdated.toDate().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })
          : "";

        return (

          <div
            key={chat.id}
            onClick={() => setSelectedChat({
              id: chat.id,
              friend: chat.friend
            })}
            className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg cursor-pointer transition"
          >

            <div className="flex items-center gap-3">

              <img
                src={chat.friend?.avatar || "/avatars/1.png"}
                className="w-10 h-10 rounded-full object-cover"
              />

              <div>

                <div className="font-medium">
                  {chat.friend?.name || "User"}
                </div>

                <div className="text-sm text-gray-400 truncate w-40">
                  {chat.lastMessage || "Start chatting"}
                </div>

              </div>

            </div>

            {/* RIGHT SIDE */}

            <div className="flex flex-col items-end gap-1">

              {time && (
                <div className="text-xs text-gray-500">
                  {time}
                </div>
              )}

              {unreadCount > 0 && (
                <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </div>
              )}

            </div>

          </div>

        );

      })}

    </div>

  );

}