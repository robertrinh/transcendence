import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './app'

// Render the main App component into the root element of the HTML
ReactDOM.createRoot(document.getElementById('root')!).render(
	<App />
)

fetch('/api/health')