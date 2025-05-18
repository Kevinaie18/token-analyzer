// script.js - Client-side JavaScript for Token Transaction Analyzer

document.addEventListener('DOMContentLoaded', function() {
  // Initialize the app
  initializeApp();
});

function initializeApp() {
  // Render the main application UI
  renderApp();
  
  // Set up event listeners
  setupEventListeners();
  
  // Check for installable PWA
  checkForInstallablePWA();
}

function renderApp() {
  const appContainer = document.getElementById('app');
  
  // Create the application HTML
  appContainer.innerHTML = `
    <div id="error-message" class="error-message"></div>
    
    <form id="analysis-form">
      <div>
        <label for="sol-price">SOL/USD Price</label>
        <input type="number" id="sol-price" placeholder="170" value="170">
      </div>
      
      <div>
        <label for="token-address">Token Address</label>
        <input type="text" id="token-address" placeholder="CfV3.......KfwkYiu" value="CfVs3waH2Z9TM397qSkaipTDhA9wWgtt8UchZKfwkYiu">
      </div>
      
      <div>
        <label for="total-supply">Total Supply</label>
        <input type="number" id="total-supply" placeholder="999982230.99" value="999982230.99">
      </div>
      
      <div>
        <label for="market-cap-threshold">Market Cap Threshold</label>
        <input type="number" id="market-cap-threshold" placeholder="5000000" value="5000000">
      </div>
      
      <div>
        <label for="csv-file">CSV File</label>
        <div class="file-upload" id="file-upload">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <div>Upload File</div>
          <input type="file" id="csv-file" accept=".csv" style="display: none;">
        </div>
      </div>
      
      <button type="submit" class="analyze-button">Analyze Transactions</button>
    </form>
    
    <div id="loading" class="loading">
      <div class="spinner"></div>
      <p>Analyzing transactions...</p>
    </div>
    
    <div id="results-container" class="results-container hidden">
      <div class="export-buttons">
        <button id="export-csv" class="export-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Export CSV
        </button>
        <button id="export-json" class="export-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Export JSON
        </button>
      </div>
      
      <div class="tab-container">
        <div class="tab active" data-tab="transactions">Transactions</div>
        <div class="tab" data-tab="whale-report">Whale Report</div>
      </div>
      
      <div id="transactions-tab" class="tab-content active">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Signature</th>
                <th>Time</th>
                <th>TOKEN2/USD Price</th>
                <th>Market Cap</th>
              </tr>
            </thead>
            <tbody id="transactions-table"></tbody>
          </table>
        </div>
      </div>
      
      <div id="whale-report-tab" class="tab-content">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Wallet</th>
                <th>Total SOL</th>
                <th>Total USD</th>
                <th>Avg Market Cap</th>
              </tr>
            </thead>
            <tbody id="whale-report-table"></tbody>
          </table>
        </div>
      </div>
    </div>
    
    <div id="install-banner" class="install-banner">
      <div>Install Token Analyzer for easier access and offline use</div>
      <button id="install-button" class="install-banner-button">Install</button>
      <button id="close-install-banner" class="install-banner-close">×</button>
    </div>
  `;
}

function setupEventListeners() {
  // DOM elements
  const form = document.getElementById('analysis-form');
  const fileUpload = document.getElementById('file-upload');
  const fileInput = document.getElementById('csv-file');
  const loadingIndicator = document.getElementById('loading');
  const resultsContainer = document.getElementById('results-container');
  const errorMessage = document.getElementById('error-message');
  const transactionsTable = document.getElementById('transactions-table');
  const whaleReportTable = document.getElementById('whale-report-table');
  const tabs = document.querySelectorAll('.tab');
  const exportCsvButton = document.getElementById('export-csv');
  const exportJsonButton = document.getElementById('export-json');
  const installBanner = document.getElementById('install-banner');
  const installButton = document.getElementById('install-button');
  const closeInstallBanner = document.getElementById('close-install-banner');
  
  // Global app state
  window.appState = {
    currentFile: null,
    analysisResults: null,
    deferredPrompt: null
  };
  
  // Handle file upload UI
  fileUpload.addEventListener('click', function() {
    fileInput.click();
  });
  
  fileInput.addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
      window.appState.currentFile = e.target.files[0];
      fileUpload.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <line x1="10" y1="9" x2="8" y2="9"></line>
        </svg>
        <div>${e.target.files[0].name}</div>
      `;
    }
  });
  
  // Add drag and drop support
  fileUpload.addEventListener('dragover', function(e) {
    e.preventDefault();
    fileUpload.style.borderColor = '#000';
    fileUpload.style.backgroundColor = 'rgba(0, 0, 0, 0.03)';
  });
  
  fileUpload.addEventListener('dragleave', function() {
    fileUpload.style.borderColor = '';
    fileUpload.style.backgroundColor = '';
  });
  
  fileUpload.addEventListener('drop', function(e) {
    e.preventDefault();
    fileUpload.style.borderColor = '';
    fileUpload.style.backgroundColor = '';
    
    if (e.dataTransfer.files.length > 0 && e.dataTransfer.files[0].type === 'text/csv') {
      window.appState.currentFile = e.// script.js - Client-side JavaScript for Token Transaction Analyzer

document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const fileUpload = document.getElementById('csv-upload');
  const fileInput = document.getElementById('csv-input');
  const fileName = document.getElementById('file-name');
  const analyzeButton = document.getElementById('analyze-button');
  const loadingIndicator = document.getElementById('loading');
  const resultsContainer = document.getElementById('results');
  const errorMessage = document.getElementById('error-message');
  const transactionsTableBody = document.getElementById('transactions-table-body');
  const whaleReportTableBody = document.getElementById('whale-report-table-body');
  const exportCsvButton = document.getElementById('export-csv');
  const exportJsonButton = document.getElementById('export-json');
  
  // Global state
  let currentFile = null;
  let analysisResults = null;
  
  // File Upload Handler
  fileUpload.addEventListener('click', function() {
    fileInput.click();
  });
  
  fileInput.addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
      currentFile = e.target.files[0];
      fileName.textContent = currentFile.name;
    }
  });
  
  // Drag and Drop Handler
  fileUpload.addEventListener('dragover', function(e) {
    e.preventDefault();
    fileUpload.classList.add('dragover');
  });
  
  fileUpload.addEventListener('dragleave', function() {
    fileUpload.classList.remove('dragover');
  });
  
  fileUpload.addEventListener('drop', function(e) {
    e.preventDefault();
    fileUpload.classList.remove('dragover');
    
    if (e.dataTransfer.files.length > 0) {
      currentFile = e.dataTransfer.files[0];
      fileName.textContent = currentFile.name;
      fileInput.files = e.dataTransfer.files;
    }
  });
  
  // Tab Switching
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab');
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Show correct content
      document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
      });
      document.getElementById(`${tabName}-tab`).style.display = 'block';
    });
  });
  
  // Analyze Button
  analyzeButton.addEventListener('click', async function() {
    // Validate inputs
    const solUsdPrice = parseFloat(document.getElementById('sol-price').value);
    const tokenAddress = document.getElementById('token-address').value;
    const totalSupply = parseFloat(document.getElementById('total-supply').value);
    const marketCapThreshold = parseFloat(document.getElementById('market-cap-threshold').value);
    
    // Validation
    if (!currentFile) {
      showError('Please upload a CSV file');
      return;
    }
    
    if (isNaN(solUsdPrice) || solUsdPrice <= 0) {
      showError('Please enter a valid SOL/USD price');
      return;
    }
    
    if (!tokenAddress) {
      showError('Please enter a token address');
      return;
    }
    
    if (isNaN(totalSupply) || totalSupply <= 0) {
      showError('Please enter a valid total supply');
      return;
    }
    
    if (isNaN(marketCapThreshold) || marketCapThreshold <= 0) {
      showError('Please enter a valid market cap threshold');
      return;
    }
    
    // Show loading state
    loadingIndicator.style.display = 'flex';
    resultsContainer.style.display = 'none';
    errorMessage.style.display = 'none';
    
    try {
      // Read file as base64
      const csvBase64 = await readFileAsBase64(currentFile);
      
      // Prepare request data
      const requestData = {
        csv_base64: csvBase64,
        sol_usd_price: solUsdPrice,
        token_address: tokenAddress,
        total_supply: totalSupply,
        market_cap_threshold: marketCapThreshold
      };
      
      // Make API request
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      // Handle response
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'An error occurred during analysis');
      }
      
      // Parse response
      const data = await response.json();
      analysisResults = data;
      
      // Display results
      displayResults(data);
      
      // Show results container
      loadingIndicator.style.display = 'none';
      resultsContainer.style.display = 'block';
      
    } catch (error) {
      loadingIndicator.style.display = 'none';
      showError(error.message);
    }
  });
  
  // Export buttons
  exportCsvButton.addEventListener('click', function() {
    if (analysisResults) {
      exportToCsv(analysisResults);
    }
  });
  
  exportJsonButton.addEventListener('click', function() {
    if (analysisResults) {
      exportToJson(analysisResults);
    }
  });
  
  // Utility Functions
  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const base64String = event.target.result.split(',')[1];
        resolve(base64String);
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsDataURL(file);
    });
  }
  
  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    resultsContainer.style.display = 'none';
  }
  
  function displayResults(data) {
    // Clear existing data
    transactionsTableBody.innerHTML = '';
    whaleReportTableBody.innerHTML = '';
    
    // Populate transactions table
    if (data.transactions && data.transactions.length > 0) {
      data.transactions.forEach(transaction => {
        const row = document.createElement('tr');
        
        // Format Transaction signature
        const sigCell = document.createElement('td');
        sigCell.textContent = transaction.Signature;
        row.appendChild(sigCell);
        
        // Format Time
        const timeCell = document.createElement('td');
        timeCell.textContent = formatDateTime(transaction['Human Time']);
        row.appendChild(timeCell);
        
        // Format TOKEN2/USD Price
        const priceCell = document.createElement('td');
        priceCell.textContent = formatPrice(transaction.TOKEN2_USD_Price);
        row.appendChild(priceCell);
        
        // Format Market Cap
        const marketCapCell = document.createElement('td');
        marketCapCell.textContent = formatMarketCap(transaction.Market_Cap_USD);
        row.appendChild(marketCapCell);
        
        transactionsTableBody.appendChild(row);
      });
    } else {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.setAttribute('colspan', '4');
      cell.textContent = 'No transaction data available';
      cell.style.textAlign = 'center';
      row.appendChild(cell);
      transactionsTableBody.appendChild(row);
    }
    
    // Populate whale report table
    if (data.whale_report && data.whale_report.length > 0) {
      data.whale_report.forEach(whale => {
        const row = document.createElement('tr');
        
        // Wallet Address
        const walletCell = document.createElement('td');
        walletCell.textContent = whale.Wallet;
        row.appendChild(walletCell);
        
        // Total SOL
        const solCell = document.createElement('td');
        solCell.textContent = whale.Total_SOL;
        row.appendChild(solCell);
        
        // Total USD
        const usdCell = document.createElement('td');
        usdCell.textContent = whale.Total_USD;
        row.appendChild(usdCell);
        
        // Average Market Cap
        const avgMarketCapCell = document.createElement('td');
        avgMarketCapCell.textContent = whale.Avg_Market_Cap_USD;
        row.appendChild(avgMarketCapCell);
        
        whaleReportTableBody.appendChild(row);
      });
    } else {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.setAttribute('colspan', '4');
      cell.textContent = 'No whale data available';
      cell.style.textAlign = 'center';
      row.appendChild(cell);
      whaleReportTableBody.appendChild(row);
    }
  }
  
  function formatDateTime(isoDate) {
    if (!isoDate) return 'N/A';
    const date = new Date(isoDate);
    return date.toLocaleString();
  }
  
  function formatPrice(price) {
    if (price === 'N/A') return 'N/A';
    return price.toFixed(4);
  }
  
  function formatMarketCap(marketCap) {
    if (marketCap === 'N/A') return 'N/A';
    return '$' + marketCap.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  
  function exportToCsv(data) {
    let csvContent = '';
    
    // Determine which tab is active
    const activeTab = document.querySelector('.tab.active').getAttribute('data-tab');
    
    if (activeTab === 'transactions' && data.transactions) {
      // Header row
      csvContent += 'Signature,Human Time,TOKEN2/USD Price,Market Cap (USD)\n';
      
      // Data rows
      data.transactions.forEach(transaction => {
        csvContent += `${transaction.Signature},${transaction['Human Time']},${transaction.TOKEN2_USD_Price},${transaction.Market_Cap_USD}\n`;
      });
      
      downloadFile(csvContent, 'transactions.csv', 'text/csv');
    } else if (activeTab === 'whale-report' && data.whale_report) {
      // Header row
      csvContent += 'Wallet,Total SOL,Total USD,Avg Market Cap USD\n';
      
      // Data rows
      data.whale_report.forEach(whale => {
        csvContent += `${whale.Wallet},${whale.Total_SOL},${whale.Total_USD},${whale.Avg_Market_Cap_USD}\n`;
      });
      
      downloadFile(csvContent, 'whale_report.csv', 'text/csv');
    }
  }
  
  function exportToJson(data) {
    // Determine which tab is active
    const activeTab = document.querySelector('.tab.active').getAttribute('data-tab');
    
    let jsonData;
    let filename;
    
    if (activeTab === 'transactions') {
      jsonData = JSON.stringify(data.transactions, null, 2);
      filename = 'transactions.json';
    } else if (activeTab === 'whale-report') {
      jsonData = JSON.stringify(data.whale_report, null, 2);
      filename = 'whale_report.json';
    }
    
    if (jsonData) {
      downloadFile(jsonData, filename, 'application/json');
    }
  }
  
  function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }
});
