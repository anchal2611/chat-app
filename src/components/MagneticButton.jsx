import { useRef } from "react";

export default function MagneticButton({ children, className }) {

  const ref = useRef(null);

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();

    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    ref.current.style.transform =
      `translate(${x * 0.25}px, ${y * 0.25}px)`;
  };

  const handleLeave = () => {
    ref.current.style.transform = "translate(0px,0px)";
  };

  return (
    <button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleLeave}
      className={className}
      style={{ transition: "transform 0.2s ease" }}
    >
      {children}
    </button>
  );
}