import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router'
import { Toaster } from 'react-hot-toast'
import ThemeWrapper from './wrappers/ThemeWrapper'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeWrapper>
      <BrowserRouter>
        <App />
        <Toaster />
      </BrowserRouter>
    </ThemeWrapper>
  </StrictMode>,
)
