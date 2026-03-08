// server.ts
import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Store the code in memory.
// Initialize with the same default as the frontend to start.
let currentCode = `// Write a functional component body here.
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

// GET endpoint to retrieve the current code
app.get('/api/render', (req, res) => {
  res.json({ code: currentCode });
});

// POST endpoint to update the code
app.post('/api/render', (req, res) => {
  const { code } = req.body;
  if (typeof code === 'string') {
    currentCode = code;
    console.log('Code updated via API');
    res.status(200).json({ message: 'Code updated successfully', code });
  } else {
    res.status(400).json({ error: 'Invalid code format. Expected { code: string }' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
