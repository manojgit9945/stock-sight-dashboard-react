
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add a console.log to help with debugging
console.log("Application starting...");

// Initialize the app
createRoot(document.getElementById("root")!).render(<App />);
