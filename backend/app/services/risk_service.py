from app.core.config import settings
def risk_band(p:float)->str:
    return "HIGH" if p>=settings.HIGH_RISK_THRESHOLD else ("MEDIUM" if p>=settings.LOW_RISK_THRESHOLD else "LOW")
