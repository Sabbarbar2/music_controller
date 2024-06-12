import React from "react";
import ReactDOM from "react-dom/client"; // Import from react-dom/client instead of react-dom
import HomePage from "./HomePage";

function App() {
    return (
        <div>
            <HomePage />
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<App />);


