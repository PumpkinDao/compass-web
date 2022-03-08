import Editor, { EditorProps, Monaco } from "@monaco-editor/react";
import { useCallback } from "react";

const setupTypescriptEditor = (monaco: Monaco) => {
  // validation settings
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false,
  });

  // compiler options
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES6,
    allowNonTsExtensions: true,
  });

  // extra libraries
  const libGlobalTyping = `
declare const cache: Record<string, string | number | boolean>;
declare namespace evm {
  /**
   *
   * @param network
   * @return Provider https://docs.ethers.io/v5/api/providers/provider/
   */
  function getProvider(
    network:
      | "ethereum"
      | "ropsten"
      | "bsc"
      | "polygon"
      | "ftm"
      | "avax"
      | "optimism"
      | "arbitrum"
      | "moonriver"
  ): any;
}

/**
 * see https://github.com/ethers-io/ethers.js/blob/master/packages/ethers/lib/ethers.d.ts
 */
declare const ethers: any;
`;

  const libGlobalUri = "ts:global.d.ts";
  monaco.languages.typescript.javascriptDefaults.addExtraLib(
    libGlobalTyping,
    libGlobalUri
  );
  monaco.editor.createModel(
    libGlobalTyping,
    "typescript",
    monaco.Uri.parse(libGlobalUri)
  );
};

const MonacoEditor = (props: EditorProps) => {
  const { theme, language, defaultLanguage } = props;

  const onMount = useCallback(
    (editor, monaco) => {
      if (language === "typescript" || defaultLanguage === "typescript") {
        setupTypescriptEditor(monaco);
      }
    },
    [language, defaultLanguage]
  );

  return <Editor {...props} theme={theme || "vs-dark"} onMount={onMount} />;
};

export default MonacoEditor;
