import unittest
import json
import base64
import pandas as pd
from io import StringIO
from analyze import handler

class TestAnalyzeAPI(unittest.TestCase):
    def setUp(self):
        # Create a sample CSV
        self.sample_csv = pd.DataFrame({
            'Signature': ['sig1', 'sig2'],
            'Human Time': ['2024-03-20 10:00:00', '2024-03-20 10:01:00'],
            'Token1 Address': ['sol', 'sol'],
            'Token1 Amount': ['1.0', '2.0'],
            'Token2 Address': ['token123', 'token123'],
            'Token2 Amount': ['100', '200']
        })
        
        # Convert to base64
        csv_buffer = StringIO()
        self.sample_csv.to_csv(csv_buffer, index=False)
        self.csv_base64 = base64.b64encode(csv_buffer.getvalue().encode()).decode()

    def test_valid_request(self):
        # Create a mock request
        request_data = {
            'csv_base64': self.csv_base64,
            'sol_usd_price': 100.0,
            'token_address': 'token123',
            'total_supply': 1000000,
            'market_cap_threshold': 1000000
        }
        
        # Create a mock handler
        h = handler()
        h.headers = {'Content-Length': str(len(json.dumps(request_data)))}
        h.rfile = StringIO(json.dumps(request_data))
        h.wfile = StringIO()
        
        # Call the handler
        h.do_POST()
        
        # Check response
        response = json.loads(h.wfile.getvalue())
        self.assertIn('transactions', response)
        self.assertIn('whale_report', response)
        self.assertEqual(len(response['transactions']), 2)

    def test_missing_parameters(self):
        # Create a mock request with missing parameters
        request_data = {
            'csv_base64': self.csv_base64,
            'sol_usd_price': 100.0
            # Missing other required parameters
        }
        
        # Create a mock handler
        h = handler()
        h.headers = {'Content-Length': str(len(json.dumps(request_data)))}
        h.rfile = StringIO(json.dumps(request_data))
        h.wfile = StringIO()
        
        # Call the handler
        h.do_POST()
        
        # Check response
        response = json.loads(h.wfile.getvalue())
        self.assertEqual(response['error'], 'Invalid request')
        self.assertIn('Missing required parameter', response['message'])

    def test_invalid_csv(self):
        # Create a mock request with invalid CSV
        request_data = {
            'csv_base64': 'invalid_base64',
            'sol_usd_price': 100.0,
            'token_address': 'token123',
            'total_supply': 1000000,
            'market_cap_threshold': 1000000
        }
        
        # Create a mock handler
        h = handler()
        h.headers = {'Content-Length': str(len(json.dumps(request_data)))}
        h.rfile = StringIO(json.dumps(request_data))
        h.wfile = StringIO()
        
        # Call the handler
        h.do_POST()
        
        # Check response
        response = json.loads(h.wfile.getvalue())
        self.assertEqual(response['error'], 'Invalid request')
        self.assertIn('Invalid base64 encoding', response['message'])

if __name__ == '__main__':
    unittest.main() 