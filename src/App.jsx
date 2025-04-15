import React, { useState } from "react";
import Form from "./components/Form";
import './App.css'
import './index.css'

function App() {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <div className={`${theme}`}>
      <button onClick={toggleTheme} className="px-6 py-4 dark:text-white">
        {theme === "light" ? "☾" : "☀︎"}
      </button>
      <Form />
    </div>
  )
}

export default App;