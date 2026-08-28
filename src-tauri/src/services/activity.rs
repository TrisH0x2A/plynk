use rusqlite::{params, Connection};
use uuid::Uuid;
use crate::errors::AppResult;
use crate::models::activity::AuditLog;

pub fn create_audit_log(
    conn: &Connection,
    workspace_id: &str,
    action: &str,
    entity_id: &str,
    entity_type: &str,
    entity_title: &str,
) -> AppResult<()> {
    create_audit_log_with_user(conn, workspace_id, action, entity_id, entity_type, entity_title, "SYS_ADMIN")
}

pub fn create_audit_log_with_user(
    conn: &Connection,
    workspace_id: &str,
    action: &str,
    entity_id: &str,
    entity_type: &str,
    entity_title: &str,
    user_name: &str,
) -> AppResult<()> {
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    let effective_user = if user_name.trim().is_empty() || user_name == "Local User" {
        "SYS_ADMIN"
    } else {
        user_name
    };

    conn.execute(
        "INSERT INTO audit_logs (id, workspace_id, action, entity_id, entity_type, entity_title, user_name, user_image, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        params![id, workspace_id, action, entity_id, entity_type, entity_title, effective_user, "", now, now],
    )?;

    Ok(())
}

pub fn get_audit_logs_by_workspace(conn: &Connection, workspace_id: &str) -> AppResult<Vec<AuditLog>> {
    let mut stmt = conn.prepare(
        "SELECT id, workspace_id, action, entity_id, entity_type, entity_title, user_name, user_image, created_at, updated_at
         FROM audit_logs WHERE workspace_id = ?1 ORDER BY created_at DESC LIMIT 50",
    )?;

    let rows = stmt.query_map(params![workspace_id], |row| {
        Ok(AuditLog {
            id: row.get(0)?,
            workspace_id: row.get(1)?,
            action: row.get(2)?,
            entity_id: row.get(3)?,
            entity_type: row.get(4)?,
            entity_title: row.get(5)?,
            user_name: row.get(6)?,
            user_image: row.get(7)?,
            created_at: row.get(8)?,
            updated_at: row.get(9)?,
        })
    })?;

    let mut result = Vec::new();
    for row in rows {
        result.push(row?);
    }
    Ok(result)
}

pub fn get_audit_logs_by_entity(conn: &Connection, entity_id: &str) -> AppResult<Vec<AuditLog>> {
    let mut stmt = conn.prepare(
        "SELECT id, workspace_id, action, entity_id, entity_type, entity_title, user_name, user_image, created_at, updated_at
         FROM audit_logs WHERE entity_id = ?1 ORDER BY created_at DESC LIMIT 20",
    )?;

    let rows = stmt.query_map(params![entity_id], |row| {
        Ok(AuditLog {
            id: row.get(0)?,
            workspace_id: row.get(1)?,
            action: row.get(2)?,
            entity_id: row.get(3)?,
            entity_type: row.get(4)?,
            entity_title: row.get(5)?,
            user_name: row.get(6)?,
            user_image: row.get(7)?,
            created_at: row.get(8)?,
            updated_at: row.get(9)?,
        })
    })?;

    let mut result = Vec::new();
    for row in rows {
        result.push(row?);
    }
    Ok(result)
}
