from http.server import BaseHTTPRequestHandler

class CORSHeaders:
    ALLOWED_ORIGINS = [
        'http://localhost:3000',
        'http://localhost:5000',
        'https://token-analyzer.vercel.app'
    ]
    
    ALLOWED_METHODS = ['GET', 'POST', 'OPTIONS']
    ALLOWED_HEADERS = [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin'
    ]
    MAX_AGE = 86400  # 24 hours

    @staticmethod
    def add_cors_headers(handler: BaseHTTPRequestHandler):
        """Add CORS headers to the response"""
        origin = handler.headers.get('Origin', '')
        
        # Check if origin is allowed
        if origin in CORSHeaders.ALLOWED_ORIGINS:
            handler.send_header('Access-Control-Allow-Origin', origin)
            handler.send_header('Access-Control-Allow-Methods', ', '.join(CORSHeaders.ALLOWED_METHODS))
            handler.send_header('Access-Control-Allow-Headers', ', '.join(CORSHeaders.ALLOWED_HEADERS))
            handler.send_header('Access-Control-Max-Age', str(CORSHeaders.MAX_AGE))
            handler.send_header('Access-Control-Allow-Credentials', 'true')

def cors_middleware(handler_class):
    """Middleware to handle CORS"""
    class CORSHandler(handler_class):
        def do_OPTIONS(self):
            """Handle preflight requests"""
            self.send_response(200)
            CORSHeaders.add_cors_headers(self)
            self.end_headers()

        def do_GET(self):
            """Add CORS headers to GET requests"""
            CORSHeaders.add_cors_headers(self)
            return handler_class.do_GET(self)

        def do_POST(self):
            """Add CORS headers to POST requests"""
            CORSHeaders.add_cors_headers(self)
            return handler_class.do_POST(self)

    return CORSHandler 