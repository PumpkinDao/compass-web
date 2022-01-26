import React from "react";
import MVP from "./pages/mvp";
import MessageBar from "./features/message-bar";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<MVP />} />
      </Routes>
      <MessageBar />
    </>
  );
}

export default App;
