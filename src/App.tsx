import React from "react";
import MVP from "./pages/mvp";
import Editor from "./features/editor";
import MessageBar from "./features/message-bar";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<MVP />} />
        <Route path="/editor" element={<Editor />} />
      </Routes>
      <MessageBar />
    </>
  );
}

export default App;
