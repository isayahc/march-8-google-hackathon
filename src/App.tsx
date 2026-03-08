import React, { useState, useCallback, useEffect } from "react";
import CodeEditor from "./components/CodeEditor";
import Preview from "./components/Preview";
import "./App.css";

const defaultCode = `// Write a functional component body here.
// Available hooks: useState, useEffect, useMemo, useRef, useCallback, useFrame, useThree...
// Returns: A React component or element directly.
// Example:

const meshRef = useRef();
const [hovered, setHover] = useState(false);
const [active, setActive] = useState(false);

useFrame((state, delta) => {
  if (meshRef.current) {
    meshRef.current.rotation.x += delta;
  }
});

return (
  <mesh
    ref={meshRef}
    scale={active ? 1.5 : 1}
    onClick={() => setActive(!active)}
    onPointerOver={() => setHover(true)}
    onPointerOut={() => setHover(false)}
  >
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
  </mesh>
);
`;

const App: React.FC = () => {
  const [code, setCode] = useState(defaultCode);
  const [runCode, setRunCode] = useState(defaultCode);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCode = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/render");
        if (response.ok) {
          const data = await response.json();
          // Assuming the server returns { code: string }
          if (data.code && data.code !== code) {
            setCode(data.code);
            setRunCode(data.code);
          }
        }
      } catch (error) {
        console.error("Error fetching code:", error);
      }
    };

    const intervalId = setInterval(fetchCode, 2000);
    return () => clearInterval(intervalId);
  }, []); // Only run once on mount

  const handleRun = useCallback(async () => {
    setRunCode(code);
    try {
      setLoading(true);
      await fetch("http://localhost:3001/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
    } catch (err) {
      console.error("Failed to sync code", err);
    } finally {
      setLoading(false);
    }
  }, [code]);

  return (
    <div className="app-container">
      <div className="left-pane">
        <div className="editor-header">
          <button onClick={handleRun} className="run-button">
            Run Code
          </button>
        </div>
        <div className="editor-content">
          <CodeEditor code={code} onChange={(val) => setCode(val || "")} />
        </div>
      </div>
      <div className="right-pane">
        <Preview code={runCode} />
      </div>
    </div>
  );
};

export default App;
