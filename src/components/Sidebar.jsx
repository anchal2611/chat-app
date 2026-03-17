import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

import AddFriend from "./AddFriend";
import ChatList from "./ChatList";

export default function Sidebar({ setSelectedChat }) {

  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {

    const loadUser = async () => {

      try {

        if (!auth.currentUser) return;

        const docRef = doc(db, "users", auth.currentUser.uid);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          setUserData(snap.data());
        }

      } catch (err) {
        console.error("Failed to load user:", err);
      }

    };

    loadUser();

  }, []);




  /* LOGOUT */

  const logout = async () => {

    try {

      await signOut(auth);
      navigate("/auth");

    } catch (err) {

      console.error("Logout failed:", err);

    }

  };




  return (

    <div className="w-80 bg-black/40 border-r border-white/10 p-4 flex flex-col">

      {/* PROFILE */}

      <div className="flex items-center justify-between gap-3 mb-6 hover:bg-white/5 p-2 rounded-lg transition">

        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/profile")}
        >

          <img
            src={userData?.avatar || "/avatars/1.png"}
            className="w-10 h-10 rounded-full object-cover"
            alt="avatar"
          />

          <div className="font-medium text-sm">
            Hello, {userData?.name || "User"}
          </div>

        </div>

        <button
          onClick={logout}
          className="text-xs text-red-400 hover:underline"
        >
          Logout
        </button>

      </div>



      {/* ADD FRIEND */}

      <AddFriend />



      {/* CHAT LIST */}

      <div className="flex-1 overflow-y-auto mt-4">

        <ChatList setSelectedChat={setSelectedChat} />

      </div>

    </div>

  );

}