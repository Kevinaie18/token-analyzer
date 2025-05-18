import requests
import base64
import json

# Sample CSV content (you would replace this with an actual CSV file)
sample_csv = """Signature,Human Time,Token1 Address,Token1 Amount,Token2 Address,Token2 Amount,Wallet
3G69zgNUuhj7egVk...,2025-05-17T22:39:40.000Z,SOL,2.5,CfVs3waH2Z9TM397qSkaipTDhA9wWgtt8UchZKfwkYiu,16953.45,8DRxtGXP8uYQ1T5...
XYZ...,2025-05-17T22:40:12.000Z,CfVs3waH2Z9TM397qSkaipTDhA9wWgtt8UchZKfwkYiu,1000.0,SOL,0.15,9FGhJ7TyP3kL6D2M...
ABC...,2025-05-17T22:45:30.000Z,SOL,1.8,CfVs3waH2Z9TM397qSkaipTDhA9wWgtt8UchZKfwkYiu,12000.0,8DRxtGXP8uYQ1T5...
"""

# Convert CSV to base64
csv_base64 = base64.b64encode(sample_csv.encode()).decode()

# Prepare API request
api_url = "http://localhost:3000/api/analyze"  # Change to your deployed Vercel URL
request_data = {
    "csv_base64": csv_base64,
    "sol_usd_price": 170,
    "token_address": "CfVs3waH2Z9TM397qSkaipTDhA9wWgtt8UchZKfwkYiu",
    "total_supply": 999982230.99,
    "market_cap_threshold": 5000000
}

def test_local():
    """Test the API locally using the Vercel dev server"""
    try:
        # Send the request
        response = requests.post(api_url, json=request_data)
        
        # Print the response status and data
        print(f"Status Code: {response.status_code}")
        print("Response:")
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_local()
