from app.models.audit_log import AuditLog
def audit(db,user,action,resource_type,resource_id=None,request_id=None,metadata=None):
    db.add(AuditLog(user_id=user.id if user else None,action=action,resource_type=resource_type,resource_id=str(resource_id) if resource_id else None,request_id=request_id,metadata_json=metadata or {})); db.flush()
