import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.jsx';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Mount App and Chatbot at the top level so Chatbot never unmounts during App internal updates */}
    <App />
  </StrictMode>,
)