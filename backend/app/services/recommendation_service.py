def generate(project,risk,shap,bottleneck):
    out=[]
    if risk>=0.7: out.append({"recommendation":"Prioritize inter-departmental review and unresolved approvals","priority":"HIGH","reason":"Model indicates high delay risk","source":"deterministic_rule"})
    if project.pending_approvals>0: out.append({"recommendation":"Escalate pending approvals","priority":"HIGH" if project.pending_approvals>=3 else "MEDIUM","reason":"Pending approvals are an active project bottleneck","source":"deterministic_rule"})
    if bottleneck["severity"] in ("HIGH","MEDIUM"): out.append({"recommendation":"Initiate stage-level intervention","priority":bottleneck["severity"],"reason":"Current stage exceeds historical benchmark","source":"bottleneck_rule"})
    return out or [{"recommendation":"Continue routine monitoring","priority":"LOW","reason":"No deterministic high-priority trigger detected","source":"deterministic_rule"}]
