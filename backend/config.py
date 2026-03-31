import os
import httpx

# --- FIX: Monkey-patch for cPanel httpx/gotrue proxy mismatch ---
original_client_init = httpx.Client.__init__
def patched_client_init(self, *args, **kwargs):
    if 'proxy' in kwargs:
        kwargs['proxies'] = kwargs.pop('proxy')
    original_client_init(self, *args, **kwargs)

original_async_init = httpx.AsyncClient.__init__
def patched_async_init(self, *args, **kwargs):
    if 'proxy' in kwargs:
        kwargs['proxies'] = kwargs.pop('proxy')
    original_async_init(self, *args, **kwargs)

httpx.Client.__init__ = patched_client_init
httpx.AsyncClient.__init__ = patched_async_init
# ----------------------------------------------------------------

from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL: str = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY: str = os.environ["SUPABASE_SERVICE_KEY"]
SUPABASE_ANON_KEY: str = os.environ["SUPABASE_ANON_KEY"]
CORS_ORIGINS: list[str] = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

# Service-role client (bypasses RLS — backend use only)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
