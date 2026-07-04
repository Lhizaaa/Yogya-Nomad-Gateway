import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import './i18n'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { AppProvider } from './context/AppContext.jsx'
import { fetchLocations } from './utils/locationStore.js'
import { fetchArticles } from './utils/articleStore.js'

function renderApp() {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ThemeProvider>
        <LanguageProvider>
          <AppProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AppProvider>
        </LanguageProvider>
      </ThemeProvider>
    </React.StrictMode>
  )
}

// Muat data lokasi & artikel dari database (READ-ONLY) sebelum render agar
// seluruh halaman langsung memakai data terbaru. Kedua fetch sudah menangani
// fallback ke JSON bila server tidak aktif / offline, jadi render dijamin
// tetap berjalan dalam kondisi apa pun.
Promise.allSettled([fetchLocations(), fetchArticles()]).finally(renderApp)
