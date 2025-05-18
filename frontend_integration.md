# Frontend Integration Guide

This document provides guidance on integrating with the Token Transaction Analyzer API from a PWA frontend application.

## API Integration

### API Endpoint
```
POST /api/analyze
```

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "csv_base64": "<BASE64_ENCODED_CSV_STRING>",
  "sol_usd_price": 170,
  "token_address": "CfVs3waH2Z9TM397qSkaipTDhA9wWgtt8UchZKfwkYiu",
  "total_supply": 999982230.99,
  "market_cap_threshold": 5000000
}
```

## File Upload Handling

Here's a sample JavaScript function to handle file uploads and convert to base64:

```javascript
function handleFileUpload(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const base64String = event.target.result
        .split(',')[1]; // Remove the data URL part
      resolve(base64String);
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
}
```

## Example API Call

```javascript
async function analyzeTransactions(formData) {
  try {
    const csvBase64 = await handleFileUpload(formData.csvFile);
    
    const requestData = {
      csv_base64: csvBase64,
      sol_usd_price: parseFloat(formData.solUsdPrice),
      token_address: formData.tokenAddress,
      total_supply: parseFloat(formData.totalSupply),
      market_cap_threshold: parseFloat(formData.marketCapThreshold)
    };
    
    const response = await fetch('https://your-vercel-app.vercel.app/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message || 'API request failed');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error analyzing transactions:', error);
    throw error;
  }
}
```

## Displaying Results

### Transaction Table Example
```html
<table>
  <thead>
    <tr>
      <th>Signature</th>
      <th>Time</th>
      <th>TOKEN2/USD Price</th>
      <th>Market Cap (USD)</th>
    </tr>
  </thead>
  <tbody>
    <!-- Use JavaScript to populate this -->
    <!-- Example: -->
    <tr v-for="transaction in transactions" :key="transaction.Signature">
      <td>{{ transaction.Signature }}</td>
      <td>{{ formatDate(transaction.Human_Time) }}</td>
      <td>{{ formatPrice(transaction.TOKEN2_USD_Price) }}</td>
      <td>{{ formatMarketCap(transaction.Market_Cap_USD) }}</td>
    </tr>
  </tbody>
</table>
```

### Whale Report Example
```html
<table>
  <thead>
    <tr>
      <th>Wallet</th>
      <th>Total SOL</th>
      <th>Total USD</th>
      <th>Avg Market Cap</th>
    </tr>
  </thead>
  <tbody>
    <!-- Use JavaScript to populate this -->
    <!-- Example: -->
    <tr v-for="whale in whaleReport" :key="whale.Wallet">
      <td>{{ shortenAddress(whale.Wallet) }}</td>
      <td>{{ whale.Total_SOL }}</td>
      <td>{{ whale.Total_USD }}</td>
      <td>{{ whale.Avg_Market_Cap_USD }}</td>
    </tr>
  </tbody>
</table>
```

## UI Design Recommendations

1. **Layout**: 
   - Use a two-panel layout on desktop (form on left, results on right)
   - Stack vertically on mobile (form on top, results below)

2. **Form Design**:
   - Group related inputs (e.g., token information together)
   - Use appropriate input types (number for numerical values)
   - Add validation with clear error messages
   - Include a large, prominent "Analyze" button

3. **Results Display**:
   - Use tabs to separate transaction data and whale report
   - Include sorting options for tables
   - Show a loading indicator during API processing
   - Add export buttons for CSV and JSON formats

4. **Error Handling**:
   - Display user-friendly error messages
   - Provide guidance on how to fix common errors
   - Allow resubmission without re-uploading files

5. **Responsive Considerations**:
   - Ensure tables are scrollable horizontally on small screens
   - Use responsive breakpoints for layout changes
   - Test thoroughly on mobile devices

## PWA Implementation

Ensure your frontend is PWA-compatible:

1. Create a manifest.json file
2. Implement a service worker
3. Add appropriate meta tags for mobile devices
4. Configure caching strategies
5. Implement offline capabilities where possible
6. Add "Add to Home Screen" functionality

## Data Export Options

To implement export functionality:

```javascript
function exportToCSV(data) {
  const csvContent = convertJsonToCsv(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'token_analysis.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportToJSON(data) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'token_analysis.json');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
```
