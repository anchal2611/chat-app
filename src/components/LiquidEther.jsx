import { useEffect, useRef } from "react";

export default function LiquidEther() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;

    let hue = 0;

    const animate = () => {
      hue += 0.5;
      el.style.background = `linear-gradient(135deg,
        hsl(${hue},80%,60%),
        hsl(${hue + 60},80%,65%),
        hsl(${hue + 120},80%,70%)
      )`;

      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        filter: "blur(120px)",
        transition: "background 0.2s",
      }}
    />
  );
}