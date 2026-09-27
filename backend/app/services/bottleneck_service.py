def analyze(p):
    cur=float(p.days_current_stage); bench=float(p.historical_stage_avg_days); over=max(0,(cur-bench)/bench*100) if bench else 0
    severity="HIGH" if over>=50 else ("MEDIUM" if over>=20 else "LOW")
    return {"primary_bottleneck":p.current_stage,"current_duration":cur,"benchmark_duration":bench,"overrun_percentage":over,"severity":severity}
