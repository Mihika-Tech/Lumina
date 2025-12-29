import time
from functools import wraps

class CircuitBreaker:
    def __init__(self, max_failures = 3, recovery_timeout = 10):
        self.max_failures = max_failures
        self.recovery_timeout = recovery_timeout
        self.failures = 0
        self.last_failure_time = None
        self.state = "CLOSED"  # Other states: "OPEN", "HALF-OPEN"

    def __call__(self, func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            if self.state == "OPEN":
                if time.time() - self.last_failure_time > self.recovery_timeout:
                    self.state = "HALF-OPEN"
                else:
                    raise Exception("Circuit is OPEN. Call blocked for safety.")
                
            try:
                result =await func(*args, **kwargs)
                if self.state == "HALF-OPEN":
                    self.state = "CLOSED"
                    self.failures = 0
                return result
            except Exception as e:
                self.failures += 1
                self.last_failure_time = time.time()
                print(f"REAL ERROR: {e}")  # <--- This will print the actual reason (e.g., 'Insufficent Quota')
                print(f"Failure detected. Count: {self.failures}")
                if self.failure >= self.max_failures:
                    self.state = "OPEN"
                    print("Circuit OPENED due to repeated failures.")
                raise e
        return wrapper 