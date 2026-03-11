import LiquidBackground from "./components/LiquidBackground";

function App() {
  return (
    <div>
      <LiquidBackground />

      <h1
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "white",
        }}
      >
        Chat App
      </h1>
    </div>
  );
}

export default App;