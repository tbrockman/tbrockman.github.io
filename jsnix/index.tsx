import React from 'react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App';

document.addEventListener("DOMContentLoaded", function (event) {
    console.log(document.getElementById('terminal'))
    createRoot(document.getElementById('terminal')!).render(
        <StrictMode>
            <App />
        </StrictMode>,
    )
})
