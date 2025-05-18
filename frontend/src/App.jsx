import { useState } from 'react'
import './App.css'

function App() {
  const [solPrice, setSolPrice] = useState('')
  const [tokenAddress, setTokenAddress] = useState('')
  const [totalSupply, setTotalSupply] = useState('')
  const [marketCap, setMarketCap] = useState('')
  const [file, setFile] = useState(null)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setData(null)
    if (!solPrice || !tokenAddress || !totalSupply || !marketCap || !file) {
      setError('Please fill in all fields and upload a CSV file.')
      return
    }
    setLoading(true)
    const formData = new FormData()
    formData.append('solPrice', solPrice)
    formData.append('tokenAddress', tokenAddress)
    formData.append('totalSupply', totalSupply)
    formData.append('marketCap', marketCap)
    formData.append('file', file)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      })
      if (!res.ok) throw new Error('API error')
      const result = await res.json()
      setData(result)
    } catch (err) {
      setError('Failed to analyze transactions.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <form className="analyze-form" onSubmit={handleSubmit}>
        <h1>Token Transaction Analysis</h1>
        <label>SOL/USD Price
          <input type="number" step="any" value={solPrice} onChange={e => setSolPrice(e.target.value)} required />
        </label>
        <label>Token Address
          <input type="text" value={tokenAddress} onChange={e => setTokenAddress(e.target.value)} required />
        </label>
        <label>Total Supply
          <input type="number" step="any" value={totalSupply} onChange={e => setTotalSupply(e.target.value)} required />
        </label>
        <label>Market Cap Threshold
          <input type="number" step="any" value={marketCap} onChange={e => setMarketCap(e.target.value)} required />
        </label>
        <label>CSV File
          <div className="file-upload-area">
            <input type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} required />
          </div>
        </label>
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>{loading ? 'Analyzing...' : 'Analyze Transactions'}</button>
      </form>
      {data && (
        <div className="results">
          <h3>Analysis Results</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default App 