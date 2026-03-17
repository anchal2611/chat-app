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
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const startTimeRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [showEmoji, setShowEmoji] = useState(false);
  const [recording, setRecording] = useState(false);

  const [imagePreview, setImagePreview] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);

  /* ================= IMAGE ================= */

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  /* ================= VOICE ================= */

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      chunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {

        const duration = Date.now() - startTimeRef.current;

        if (duration < 500) {
          alert("Hold mic longer 🎤");
          return;
        }

        const blob = new Blob(chunksRef.current, {
          type: "audio/webm"
        });

        const reader = new FileReader();
        reader.onloadend = () => {
          setAudio(reader.result);
          setAudioPreview(reader.result);
        };
        reader.readAsDataURL(blob);

        streamRef.current.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(200);
      setRecording(true);

    } catch (err) {
      alert("Mic permission denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  /* ================= TYPING ================= */

  const handleTyping = async (value) => {

    setText(value);

    if (!selectedChat || !auth.currentUser) return;

    await updateDoc(doc(db, "chats", selectedChat.id), {
      [`typing.${auth.currentUser.uid}`]: true
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(async () => {
      await updateDoc(doc(db, "chats", selectedChat.id), {
        [`typing.${auth.currentUser.uid}`]: false
      });
    }, 1200);
  };

  /* ================= EMOJI ================= */

  const handleEmoji = (emoji) => {
    handleTyping(text + emoji.native);
  };

  /* ================= SEND ================= */

  const handleSend = async () => {

    if (!text.trim() && !imagePreview && !audioPreview) return;

    await sendMessage();

    setImagePreview(null);
    setAudioPreview(null);

    if (selectedChat && auth.currentUser) {
      await updateDoc(doc(db, "chats", selectedChat.id), {
        [`typing.${auth.currentUser.uid}`]: false
      });
    }
  };

  /* ================= UI ================= */

  return (
    <div className="relative">

      {/* 🔥 PREVIEW */}
      {(imagePreview || audioPreview) && (
        <div className="p-3 bg-black/40 border-b border-white/10 flex items-center gap-4">

          {/* IMAGE */}
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <button
                onClick={() => {
                  setImagePreview(null);
                  setImage(null);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 rounded-full"
              >
                ✕
              </button>
            </div>
          )}

          {/* AUDIO */}
          {audioPreview && (
            <div className="flex items-center gap-2">
              <audio controls src={audioPreview} />
              <button
                onClick={() => {
                  setAudioPreview(null);
                  setAudio(null);
                }}
                className="text-red-400 text-xs"
              >
                ✕
              </button>
            </div>
          )}

        </div>
      )}

      {/* EMOJI */}
      {showEmoji && (
        <div className="absolute bottom-16 left-20 z-50">
          <Picker data={data} onEmojiSelect={handleEmoji} theme="dark" />
        </div>
      )}

      {/* INPUT BAR */}
      <div className="h-16 border-t border-white/10 flex items-center px-4 gap-4">

        <input
          type="file"
          accept="image/*"
          ref={fileRef}
          onChange={handleImage}
          className="hidden"
        />

        <Paperclip onClick={() => fileRef.current.click()} />

        <input
          value={text}
          onChange={(e) => handleTyping(e.target.value)}
          className="flex-1 bg-white/5 rounded px-4 py-2 outline-none"
        />

        <Smile onClick={() => setShowEmoji(!showEmoji)} />

        {recording ? (
          <>
            <span className="text-red-500 text-sm">Recording...</span>
            <button onClick={stopRecording}>Stop</button>
          </>
        ) : (
          <Mic onClick={startRecording} />
        )}

        <button
          onClick={handleSend}
          className="bg-purple-500 px-4 py-2 rounded-lg"
        >
          Send
        </button>

      </div>
    </div>
  );
}