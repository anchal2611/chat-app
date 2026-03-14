import { MessageCircle, Shield, Zap } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <MessageCircle size={32} />,
      title: "Realtime Messaging",
      desc: "Send and receive messages instantly with live updates."
    },
    {
      icon: <Shield size={32} />,
      title: "Secure Chats",
      desc: "End-to-end security and reliable authentication."
    },
    {
      icon: <Zap size={32} />,
      title: "Fast & Modern",
      desc: "Lightning fast performance with a beautiful interface."
    }
  ];

  return (
    <section className="relative z-10 py-32 px-6">
      <h2 className="text-4xl font-bold text-center mb-16 text-white">
        Features
      </h2>

      <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {features.map((f, i) => (
          <div
            key={i}
            className="electric-card flex flex-col items-center text-center"
          >
            {/* Icon */}
            <div className="text-purple-400 mb-4 flex justify-center">
              {f.icon}
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold mb-2 text-white">
              {f.title}
            </h3>

            {/* Description */}
            <p className="text-gray-400 text-sm max-w-xs">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}