import pandas as pd
from io import StringIO
import base64

class CSVValidator:
    REQUIRED_COLUMNS = ['Signature', 'Human Time']
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    ALLOWED_DATE_FORMATS = [
        '%Y-%m-%d %H:%M:%S',
        '%Y-%m-%d %H:%M:%S.%f',
        '%d/%m/%Y %H:%M:%S',
        '%m/%d/%Y %H:%M:%S'
    ]

    @staticmethod
    def validate_csv_base64(csv_base64):
        """Validate base64 encoded CSV data"""
        try:
            # Check if base64 string is valid
            csv_data = base64.b64decode(csv_base64).decode('utf-8')
            
            # Check file size
            if len(csv_data.encode('utf-8')) > CSVValidator.MAX_FILE_SIZE:
                raise ValueError(f"File size exceeds maximum limit of {CSVValidator.MAX_FILE_SIZE/1024/1024}MB")
            
            # Parse CSV
            df = pd.read_csv(StringIO(csv_data))
            
            # Validate required columns
            missing_columns = [col for col in CSVValidator.REQUIRED_COLUMNS if col not in df.columns]
            if missing_columns:
                raise ValueError(f"Missing required columns: {', '.join(missing_columns)}")
            
            # Validate date format
            try:
                pd.to_datetime(df['Human Time'], format='mixed')
            except ValueError:
                raise ValueError("Invalid date format in 'Human Time' column")
            
            # Validate data types
            if not df['Signature'].str.match(r'^[A-Za-z0-9+/=]+$').all():
                raise ValueError("Invalid signature format")
            
            return df
            
        except base64.binascii.Error:
            raise ValueError("Invalid base64 encoding")
        except UnicodeDecodeError:
            raise ValueError("Invalid UTF-8 encoding")
        except pd.errors.EmptyDataError:
            raise ValueError("Empty CSV file")
        except pd.errors.ParserError:
            raise ValueError("Invalid CSV format")
        except Exception as e:
            raise ValueError(f"CSV validation error: {str(e)}")

    @staticmethod
    def validate_token_columns(df):
        """Validate token-related columns"""
        token_columns = {
            'token1_address': None,
            'token1_amount': None,
            'token2_address': None,
            'token2_amount': None
        }
        
        # Look for token columns
        for col in df.columns:
            col_lower = col.lower()
            if 'token1' in col_lower and 'address' in col_lower:
                token_columns['token1_address'] = col
            elif 'token1' in col_lower and 'amount' in col_lower:
                token_columns['token1_amount'] = col
            elif 'token2' in col_lower and 'address' in col_lower:
                token_columns['token2_address'] = col
            elif 'token2' in col_lower and 'amount' in col_lower:
                token_columns['token2_amount'] = col
        
        # Check if all required token columns are present
        missing_columns = [k for k, v in token_columns.items() if v is None]
        if missing_columns:
            raise ValueError(f"Missing required token columns: {', '.join(missing_columns)}")
        
        return token_columns 