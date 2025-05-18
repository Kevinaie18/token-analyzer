from http.server import BaseHTTPRequestHandler
import os

class CacheHeaders:
    # Cache durations in seconds
    STATIC_ASSETS = 86400  # 24 hours
    API_RESPONSE = 300     # 5 minutes
    NO_CACHE = 0          # No caching

    @staticmethod
    def add_cache_headers(handler: BaseHTTPRequestHandler, path: str):
        """Add appropriate cache headers based on the file type"""
        if path.startswith('/api/'):
            # API responses should be cached for a short time
            handler.send_header('Cache-Control', f'public, max-age={CacheHeaders.API_RESPONSE}')
            handler.send_header('Vary', 'Accept-Encoding')
        elif any(path.endswith(ext) for ext in ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.ico']):
            # Static assets should be cached longer
            handler.send_header('Cache-Control', f'public, max-age={CacheHeaders.STATIC_ASSETS}')
            handler.send_header('Vary', 'Accept-Encoding')
        else:
            # HTML and other files should not be cached
            handler.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            handler.send_header('Pragma', 'no-cache')
            handler.send_header('Expires', '0')

def cache_headers_middleware(handler_class):
    """Middleware to add cache headers to responses"""
    class CacheHeadersHandler(handler_class):
        def end_headers(self):
            # Get the current path
            path = self.path.split('?')[0]  # Remove query parameters
            
            # Add cache headers
            CacheHeaders.add_cache_headers(self, path)
            
            # Call the original end_headers
            return handler_class.end_headers(self)
    
    return CacheHeadersHandler 