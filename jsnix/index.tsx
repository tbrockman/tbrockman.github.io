import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App';

createRoot(document.getElementById('jsnix')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)