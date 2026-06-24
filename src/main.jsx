import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Storefront from './pages/Storefront'

createRoot(document.getElementById('root')).render(
  <React.StrictMode><Storefront /></React.StrictMode>
)
