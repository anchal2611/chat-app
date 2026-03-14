import MagneticButton from "./MagneticButton";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="h-screen flex flex-col items-center justify-center text-center text-white px-6">

      <h1 className="text-6xl font-bold leading-tight max-w-3xl">
        Chat freely with your friends
      </h1>

      <p className="mt-6 text-lg text-gray-300 max-w-xl">
        ChatterBox is a modern realtime chat platform where you can connect,
        message and share instantly.
      </p>

      <div className="mt-10 flex gap-4">

        {/* Go to Auth Page */}
        <Link to="/auth">
          <MagneticButton className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-purple-400 hover:text-white transition">
            Get Started
          </MagneticButton>
        </Link>

        {/* Scroll to features section */}
        <a href="#features">
          <MagneticButton className="px-6 py-3 border border-white rounded-full hover:bg-white hover:text-black transition">
            Learn More
          </MagneticButton>
        </a>

      </div>

    </section>
  );
}