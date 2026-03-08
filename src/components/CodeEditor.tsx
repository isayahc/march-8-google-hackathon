import React from "react";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange }) => {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Editor
        height="100%"
        defaultLanguage="typescript"
        defaultValue={code}
        onChange={onChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
        }}
      />
    </div>
  );
};

export default CodeEditor;
