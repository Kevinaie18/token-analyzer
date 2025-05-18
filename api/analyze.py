from http.server import BaseHTTPRequestHandler
import json
import base64
import pandas as pd
from io import StringIO, BytesIO
import traceback
import re
import rate_limiter
import cache_headers
import cors
import csv_validator
import cgi

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        ctype, pdict = cgi.parse_header(self.headers.get('content-type'))
        if ctype == 'multipart/form-data':
            pdict['boundary'] = bytes(pdict['boundary'], "utf-8")
            pdict['CONTENT-LENGTH'] = int(self.headers['content-length'])
            form = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={'REQUEST_METHOD': 'POST'},
                keep_blank_values=True
            )
            try:
                # Extract fields from the form
                sol_usd_price = float(form.getvalue('solPrice'))
                token_address = form.getvalue('tokenAddress')
                total_supply = float(form.getvalue('totalSupply'))
                market_cap_threshold = float(form.getvalue('marketCap'))
                fileitem = form['file']
                if not fileitem.file:
                    self._send_error(400, "No file uploaded.")
                    return
                file_content = fileitem.file.read()
                csv_base64 = base64.b64encode(file_content).decode('utf-8')

                # Validate CSV data
                try:
                    df = csv_validator.CSVValidator.validate_csv_base64(csv_base64)
                    token_columns = csv_validator.CSVValidator.validate_token_columns(df)
                except ValueError as e:
                    self._send_error(400, str(e))
                    return

                # Process the data
                result = self._process_transactions(
                    df,
                    sol_usd_price,
                    token_address,
                    total_supply,
                    market_cap_threshold,
                    token_columns
                )

                # Send successful response
                self._send_success(result)

            except Exception as e:
                print(f"Internal server error: {traceback.format_exc()}")
                self._send_error(500, "An unexpected error occurred. Please try again later.")
        else:
            self._send_error(400, "Content-Type must be multipart/form-data.")

    def _process_transactions(self, df, sol_usd_price, token_address, total_supply, market_cap_threshold, token_columns):
        """
        Process the transaction data to calculate TOKEN2/USD Price, Market Cap, 
        and perform Whale & Early Buyer Analysis.
        """
        # Create arrays for results
        transactions = []
        
        # Track wallets for whale analysis
        whale_data = {}
        
        for index, row in df.iterrows():
            transaction = {
                "Signature": row["Signature"],
                "Human Time": row["Human Time"]
            }
            
            # Get token addresses
            token1_address = str(row[token_columns['token1_address']]).lower()
            token2_address = str(row[token_columns['token2_address']]).lower()
            
            # Check if Token1 is SOL (handle different case variations)
            is_sol_transaction = token1_address == "sol" or token1_address == "solana"
            
            # Check if Token2 matches the input token address
            is_target_token = token2_address == token_address.lower()
            
            if is_sol_transaction and is_target_token:
                try:
                    # Convert amounts to float (handle string formats)
                    token1_amount = self._parse_numeric(row[token_columns['token1_amount']])
                    token2_amount = self._parse_numeric(row[token_columns['token2_amount']])
                    
                    # Prevent division by zero
                    if token2_amount > 0:
                        # Calculate price based on the ratio of SOL to token2 and SOL/USD price
                        token2_usd_price = (token1_amount / token2_amount) * sol_usd_price
                        market_cap_usd = token2_usd_price * total_supply
                        
                        transaction["TOKEN2_USD_Price"] = round(token2_usd_price, 4)
                        transaction["Market_Cap_USD"] = round(market_cap_usd, 2)
                        
                        # Track for whale analysis if this is before market cap threshold
                        if market_cap_usd < market_cap_threshold:
                            # Get wallet address from appropriate column
                            wallet_address = self._get_wallet_address(row, token_columns.get('wallet'))
                            
                            if wallet_address not in whale_data:
                                whale_data[wallet_address] = {
                                    "sol_invested": 0,
                                    "market_caps": []
                                }
                            
                            whale_data[wallet_address]["sol_invested"] += token1_amount
                            whale_data[wallet_address]["market_caps"].append(market_cap_usd)
                    else:
                        transaction["TOKEN2_USD_Price"] = "N/A"
                        transaction["Market_Cap_USD"] = "N/A"
                except (ValueError, TypeError):
                    transaction["TOKEN2_USD_Price"] = "N/A"
                    transaction["Market_Cap_USD"] = "N/A"
            else:
                transaction["TOKEN2_USD_Price"] = "N/A"
                transaction["Market_Cap_USD"] = "N/A"
            
            transactions.append(transaction)
        
        # Process whale report
        whale_report = []
        for wallet, data in whale_data.items():
            total_sol = data["sol_invested"]
            total_usd = total_sol * sol_usd_price
            avg_market_cap = sum(data["market_caps"]) / len(data["market_caps"]) if data["market_caps"] else 0
            
            whale_report.append({
                "Wallet": wallet,
                "Total_SOL": f"{total_sol:.2f} SOL",
                "Total_USD": f"${total_usd:,.2f}",
                "Avg_Market_Cap_USD": f"${avg_market_cap / 1000000:.2f}M" if avg_market_cap >= 1000000 else f"${avg_market_cap:,.2f}"
            })
        
        # Sort whale report by Total SOL invested (descending)
        whale_report.sort(key=lambda x: float(x["Total_SOL"].split()[0]), reverse=True)
        
        return {
            "transactions": transactions,
            "whale_report": whale_report
        }
    
    def _parse_numeric(self, value):
        """Parse numeric values from various formats"""
        if isinstance(value, (int, float)):
            return float(value)
        if isinstance(value, str):
            # Remove any currency symbols and commas
            value = re.sub(r'[^\d.-]', '', value)
            return float(value)
        raise ValueError(f"Invalid numeric value: {value}")
    
    def _get_wallet_address(self, row, wallet_column):
        """Get wallet address from the appropriate column"""
        if wallet_column and wallet_column in row:
            return str(row[wallet_column]).lower()
        return "unknown"
    
    def _send_success(self, data):
        """Send a successful response"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def _send_error(self, code, message):
        """Send an error response"""
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({
            'error': 'Invalid request',
            'message': message
        }).encode())

# Apply middlewares
handler = rate_limiter.rate_limit_middleware(handler)
handler = cache_headers.cache_headers_middleware(handler)
handler = cors.cors_middleware(handler)

def main(req, context):
    return handler(req, context)
