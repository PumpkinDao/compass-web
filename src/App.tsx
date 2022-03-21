import React from "react";
import MVP from "./pages/mvp";
import Editor from "./features/editor";
import Trigger from "./features/trigger";
import MessageBar from "./features/message-bar";
import { Route, Routes } from "react-router-dom";
import Notifier from "./features/notifier";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<MVP />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/trigger" element={<Trigger />} />
        <Route path="/notifier" element={<Notifier />} />
      </Routes>
      <MessageBar />
    </>
  );
}

export default App;
