from http.server import BaseHTTPRequestHandler
import time
from collections import defaultdict
import threading
import json

class RateLimiter:
    def __init__(self, requests_per_minute=60):
        self.requests_per_minute = requests_per_minute
        self.requests = defaultdict(list)
        self.lock = threading.Lock()

    def is_rate_limited(self, ip):
        with self.lock:
            now = time.time()
            # Remove requests older than 1 minute
            self.requests[ip] = [req_time for req_time in self.requests[ip] 
                               if now - req_time < 60]
            
            # Check if rate limit is exceeded
            if len(self.requests[ip]) >= self.requests_per_minute:
                return True
            
            # Add current request
            self.requests[ip].append(now)
            return False

# Create a global rate limiter instance
rate_limiter = RateLimiter()

def rate_limit_middleware(handler_class):
    class RateLimitedHandler(handler_class):
        def do_POST(self):
            # Get client IP
            ip = self.client_address[0]
            
            # Check rate limit
            if rate_limiter.is_rate_limited(ip):
                self.send_response(429)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Retry-After', '60')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'error': 'Rate limit exceeded',
                    'message': 'Too many requests. Please try again later.',
                    'retry_after': 60
                }).encode())
                return
            
            # If not rate limited, proceed with original handler
            return handler_class.do_POST(self)
    
    return RateLimitedHandler 