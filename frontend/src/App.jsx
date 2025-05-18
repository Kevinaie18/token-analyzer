import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import './App.css'

function App() {
  const [data, setData] = useState(null)

  return (
    <div className="app">
      <header className="app-header">
        <h1>Token Analyzer</h1>
      </header>
      <main>
        <Routes>
          <Route path="/" element={
            <div className="upload-section">
              <h2>Upload Transaction Data</h2>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    const formData = new FormData()
                    formData.append('file', file)
                    
                    fetch('/api/analyze', {
                      method: 'POST',
                      body: formData
                    })
                    .then(res => res.json())
                    .then(data => setData(data))
                    .catch(err => console.error('Error:', err))
                  }
                }}
              />
              {data && (
                <div className="results">
                  <h3>Analysis Results</h3>
                  <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
              )}
            </div>
          } />
        </Routes>
      </main>
    </div>
  )
}

export default App 