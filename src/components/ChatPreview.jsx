export default function ChatPreview() {
  const messages = [
    {
      type: "text",
      from: "left",
      avatar: "https://i.pravatar.cc/40?img=5",
      text: "Hey! Did you try ChatterBox yet?",
      time: "12:01"
    },
    {
      type: "text",
      from: "right",
      avatar: "https://i.pravatar.cc/40?img=15",
      text: "Yeah! The realtime chat is insanely fast.",
      time: "12:01"
    },
    {
      type: "image",
      from: "left",
      avatar: "https://i.pravatar.cc/40?img=5",
      image:
        "https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?w=400",
      time: "12:02"
    },
    {
      type: "voice",
      from: "right",
      avatar: "https://i.pravatar.cc/40?img=15",
      time: "12:02"
    }
  ];

  return (
    <section className="relative z-10 py-32 px-6">

      <h2 className="text-4xl font-bold text-center text-white mb-16">
        Live Chat Preview
      </h2>

      <div className="max-w-2xl mx-auto">

        {/* Chat Window */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">

          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
            <img
              src="https://i.pravatar.cc/40?img=5"
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="text-white text-sm font-semibold">Ava</p>
              <p className="text-xs text-green-400">online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="p-6 space-y-5">

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-end gap-3 ${
                  msg.from === "right" ? "justify-end" : ""
                } animate-message`}
                style={{ animationDelay: `${i * 0.4}s` }}
              >
                {msg.from === "left" && (
                  <img src={msg.avatar} className="w-8 h-8 rounded-full" />
                )}

                {/* Message bubble */}
                <div
                  className={`px-4 py-3 rounded-2xl max-w-xs ${
                    msg.from === "right"
                      ? "bg-purple-500/30 text-white"
                      : "bg-white/10 text-white"
                  }`}
                >
                  {msg.type === "text" && (
                    <p className="text-sm">{msg.text}</p>
                  )}

                  {msg.type === "image" && (
                    <img
                      src={msg.image}
                      className="rounded-xl w-48"
                    />
                  )}

                  {msg.type === "voice" && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                      <div className="h-1 w-24 bg-white/30 rounded"></div>
                      <span className="text-xs opacity-70">0:08</span>
                    </div>
                  )}

                  <span className="text-xs opacity-60 block mt-1">
                    {msg.time}
                  </span>
                </div>

                {msg.from === "right" && (
                  <img src={msg.avatar} className="w-8 h-8 rounded-full" />
                )}
              </div>
            ))}

            {/* Typing indicator */}
            <div className="flex items-center gap-3 animate-message">
              <img
                src="https://i.pravatar.cc/40?img=5"
                className="w-8 h-8 rounded-full"
              />

              <div className="bg-white/10 px-4 py-2 rounded-2xl flex gap-1">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}