'''
Rate limiting module for brute force protection
'''

from typing import Dict, List
from datetime import datetime, timedelta

class RateLimiter:
    def __init__(self):
        self.attempts: Dict[str, List[datetime]] = {}
        self.lockouts: Dict[str, datetime] = {}
    
    def is_locked_out(self, ip: str) -> bool:
        if ip in self.lockouts:
            lockout_time = self.lockouts[ip]
            if datetime.now() < lockout_time:
                return True
            else:
                del self.lockouts[ip]
        return False
    
    def check_rate_limit(self, ip: str, max_attempts: int = 5, window_seconds: int = 300) -> Dict:
        if self.is_locked_out(ip):
            remaining_time = (self.lockouts[ip] - datetime.now()).seconds
            return {
                'allowed': False,
                'reason': 'locked_out',
                'retry_after': remaining_time
            }
        
        now = datetime.now()
        window_start = now - timedelta(seconds=window_seconds)
        
        if ip not in self.attempts:
            self.attempts[ip] = []
        
        self.attempts[ip] = [t for t in self.attempts[ip] if t > window_start]
        
        if len(self.attempts[ip]) >= max_attempts:
            self.lockouts[ip] = now + timedelta(minutes=15)
            return {
                'allowed': False,
                'reason': 'rate_limited',
                'retry_after': 900
            }
        
        self.attempts[ip].append(now)
        
        return {
            'allowed': True,
            'attempts_remaining': max_attempts - len(self.attempts[ip])
        }
    
    def clear_attempts(self, ip: str):
        if ip in self.attempts:
            del self.attempts[ip]
        if ip in self.lockouts:
            del self.lockouts[ip]

rate_limiter = RateLimiter()
