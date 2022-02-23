import Editor, { EditorProps } from "@monaco-editor/react";

const MonacoEditor = ({ theme, ...rest }: EditorProps) => (
  <Editor theme={theme || "vs-dark"} {...rest} />
);

export default MonacoEditor;
