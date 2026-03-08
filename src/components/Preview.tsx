import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import * as Fiber from "@react-three/fiber";
import * as Drei from "@react-three/drei";
import { transform } from "sucrase";

interface PreviewProps {
  code: string;
}

const Preview: React.FC<PreviewProps> = ({ code }) => {
  const [Component, setComponent] = useState<React.FC | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;

    try {
      // 1. Transpile TS/JSX to JS
      const transformed = transform(code, {
        transforms: ["typescript", "jsx"],
        jsxPragma: "React.createElement",
        jsxFragmentPragma: "React.Fragment",
      }).code;

      // 2. Wrap code in a function body that returns a component or is the component body
      // We'll assume the user writes the body of a functional component.
      // E.g. "return <mesh />"
      // So we construct: new Function('React', 'THREE', ...args, code)
      
      // However, to support hooks, it must be a component function.
      // We can create a functional component:
      // const UserComp = (props) => { ...userCode... }
      
      // Let's create a factory function that defines the component
      // formattedCode: `return function UserComponent(props) { ${transformed} }`
      
      // Scope for dependency injection
      const scope = {
        React,
        THREE,
        useState,
        useEffect,
        useMemo,
        useRef,
        useCallback,
        ...Fiber,
        ...Drei,
      };

      const scopeKeys = Object.keys(scope);
      const scopeValues = Object.values(scope);

      // Create a function that returns the component
      // The function body will be the transpiled code.
      // Wait, if transformed code has `import`, it will fail.
      // We assume no imports, just usage of available scope.
      
      // Let's wrap it nicely
      // The user code is the BODY of the component.
      // So "return <mesh...>" needs to be there.
      
      const factory = new Function(...scopeKeys, transformed);
      
      // This factory corresponds to the UserComponent function itself? 
      // No, new Function creates a function with body `transformed`.
      // So if `transformed` is `return React.createElement(...)`, then calling `factory` returns the element.
      // But hooks (useFrame) must be called *inside* a component.
      // So `factory` IS the component function?
      // Yes! `const UserComponent = factory.bind(null, ...scopeValues)`? No.
      // `const UserComponent = (props) => factory(...scopeValues, props)`?
      // No, `factory` expects scope keys as arguments.
      // So we call it with scope values.
      
      const UserComponent = () => {
         return factory(...scopeValues);
      }
      
      setComponent(() => UserComponent);
      setError(null);

    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  }, [code]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {error && (
        <div style={{
          position: "absolute", 
          top: 0, 
          left: 0, 
          right: 0, 
          padding: "10px", 
          background: "rgba(255,0,0,0.8)", 
          color: "white", 
          zIndex: 10 
        }}>
          {error}
        </div>
      )}
      <Canvas>
        <Drei.OrbitControls />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        {Component && <Component />}
      </Canvas>
    </div>
  );
};

export default Preview;
