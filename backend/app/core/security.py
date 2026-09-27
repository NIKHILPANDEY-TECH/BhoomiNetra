from datetime import datetime, timedelta, timezone
import uuid
from jose import jwt, JWTError
from pwdlib import PasswordHash
from app.core.config import settings
password_hash=PasswordHash.recommended()
ALGORITHM="HS256"
def hash_password(password:str)->str: return password_hash.hash(password)
def verify_password(password:str, hashed:str)->bool: return password_hash.verify(password,hashed)
def create_token(subject:str, token_type:str, expires:timedelta)->str:
    now=datetime.now(timezone.utc); return jwt.encode({"sub":subject,"type":token_type,"jti":str(uuid.uuid4()),"iat":now,"exp":now+expires},settings.JWT_SECRET_KEY,algorithm=ALGORITHM)
def create_access_token(subject:str): return create_token(subject,"access",timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
def create_refresh_token(subject:str): return create_token(subject,"refresh",timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS))
def decode_token(token:str): return jwt.decode(token,settings.JWT_SECRET_KEY,algorithms=[ALGORITHM])
