# Token Transaction Analyzer API

A serverless Python API for analyzing token transaction CSV files, calculating TOKEN2/USD Price, Market Cap, and performing Whale & Early Buyer Analysis.

## Overview

This project provides a serverless API deployment on Vercel that processes CSV data containing token transactions. It identifies early buyers and performs market analysis based on provided parameters.

## Features

- Parse token transaction CSV data
- Calculate TOKEN2/USD Price based on SOL/USD price
- Calculate Market Cap when applicable
- Perform Whale & Early Buyer Analysis
- Return structured JSON results

## Deployment

### Prerequisites

- Vercel CLI
- Python 3.9+
- Pip (Python package manager)

### Setup

1. Clone this repository:
```bash
git clone <repository-url>
cd token-analyzer
```

2. Install the Vercel CLI:
```bash
npm install -g vercel
```

3. Login to Vercel:
```bash
vercel login
```

4. Deploy to Vercel:
```bash
vercel --prod
```

## Local Development

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

2. Run the Vercel dev server:
```bash
vercel dev
```

3. Use the `test_api.py` script to test the API locally:
```bash
python test_api.py
```

## API Usage

### Endpoint

```
POST /api/analyze
```

### Request Format

```json
{
  "csv_base64": "<BASE64_ENCODED_CSV_STRING>",
  "sol_usd_price": 170,
  "token_address": "CfVs3waH2Z9TM397qSkaipTDhA9wWgtt8UchZKfwkYiu",
  "total_supply": 999982230.99,
  "market_cap_threshold": 5000000
}
```

### CSV Format Requirements

The CSV file should contain the following columns:
- `Signature`: Transaction signature
- `Human Time`: Transaction timestamp
- `Token1 Address`: Address of the first token in the transaction
- `Token1 Amount`: Amount of the first token
- `Token2 Address`: Address of the second token in the transaction
- `Token2 Amount`: Amount of the second token
- `Wallet` or `Account`: Wallet address (for whale analysis)

### Response Format

```json
{
  "transactions": [
    {
      "Signature": "3G69zgNUuhj7egVk...",
      "Human Time": "2025-05-17T22:39:40.000Z",
      "TOKEN2_USD_Price": 0.0250,
      "Market_Cap_USD": 25027280.00
    }
  ],
  "whale_report": [
    {
      "Wallet": "8DRxtGXP8uYQ1T5...",
      "Total_SOL": "298.70 SOL",
      "Total_USD": "$50,779.17",
      "Avg_Market_Cap_USD": "$2.29M"
    }
  ]
}
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- 400: Bad Request (missing parameters, invalid types, invalid CSV)
- 422: Unprocessable Entity (calculation errors)
- 500: Internal Server Error

Error responses follow this format:
```json
{
  "error": {
    "code": 400,
    "message": "Missing required parameter: sol_usd_price"
  }
}
```

## Additional Information

For more detailed information, refer to:
- `requirements.md`: API & Project Requirements
- `support.md`: Error Handling and Support Guidelines
