use rusqlite::{params, Connection};
use uuid::Uuid;
use crate::errors::{AppError, AppResult};
use crate::models::whiteboard::Whiteboard;
use crate::services::activity::create_audit_log_with_user;

pub fn get_whiteboards_by_workspace(
    conn: &Connection,
    workspace_id: &str,
) -> AppResult<Vec<Whiteboard>> {
    let mut stmt = conn.prepare(
        "SELECT id, workspace_id, title, canvas_data, created_at, updated_at FROM whiteboards WHERE workspace_id = ?1 ORDER BY created_at DESC",
    )?;

    let rows = stmt.query_map(params![workspace_id], |row| {
        Ok(Whiteboard {
            id: row.get(0)?,
            workspace_id: row.get(1)?,
            title: row.get(2)?,
            canvas_data: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    })?;

    let mut whiteboards = Vec::new();
    for wb in rows {
        whiteboards.push(wb?);
    }

    Ok(whiteboards)
}

pub fn get_whiteboard(conn: &Connection, id: &str) -> AppResult<Whiteboard> {
    conn.query_row(
        "SELECT id, workspace_id, title, canvas_data, created_at, updated_at FROM whiteboards WHERE id = ?1",
        params![id],
        |row| {
            Ok(Whiteboard {
                id: row.get(0)?,
                workspace_id: row.get(1)?,
                title: row.get(2)?,
                canvas_data: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        },
    )
    .map_err(|_| AppError::NotFound(format!("Whiteboard {} not found", id)))
}

pub fn create_whiteboard(
    conn: &Connection,
    workspace_id: &str,
    title: String,
    user_name: Option<String>,
) -> AppResult<Whiteboard> {
    if title.trim().is_empty() {
        return Err(AppError::Validation("Whiteboard title cannot be empty".into()));
    }

    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    let initial_canvas = r#"{"layers":{},"layerIds":[]}"#;

    conn.execute(
        "INSERT INTO whiteboards (id, workspace_id, title, canvas_data, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![id, workspace_id, title, initial_canvas, now, now],
    )?;

    let actor = user_name.as_deref().unwrap_or("SYS_ADMIN");
    create_audit_log_with_user(conn, workspace_id, "CREATE", &id, "WHITEBOARD", &title, actor)?;

    Ok(Whiteboard {
        id,
        workspace_id: workspace_id.to_string(),
        title,
        canvas_data: initial_canvas.to_string(),
        created_at: now.clone(),
        updated_at: now,
    })
}

pub fn update_whiteboard(
    conn: &Connection,
    id: &str,
    title: String,
    user_name: Option<String>,
) -> AppResult<Whiteboard> {
    let now = chrono::Utc::now().to_rfc3339();
    let existing = get_whiteboard(conn, id)?;

    conn.execute(
        "UPDATE whiteboards SET title = ?1, updated_at = ?2 WHERE id = ?3",
        params![title, now, id],
    )?;

    let actor = user_name.as_deref().unwrap_or("SYS_ADMIN");
    create_audit_log_with_user(conn, &existing.workspace_id, "RENAMED", id, "WHITEBOARD", &title, actor)?;

    get_whiteboard(conn, id)
}

pub fn save_whiteboard_canvas(
    conn: &Connection,
    id: &str,
    canvas_data: String,
) -> AppResult<()> {
    let now = chrono::Utc::now().to_rfc3339();
    conn.execute(
        "UPDATE whiteboards SET canvas_data = ?1, updated_at = ?2 WHERE id = ?3",
        params![canvas_data, now, id],
    )?;
    Ok(())
}

pub fn delete_whiteboard(
    conn: &Connection,
    id: &str,
    user_name: Option<String>,
) -> AppResult<()> {
    let actor = user_name.as_deref().unwrap_or("SYS_ADMIN");
    crate::services::recycle_bin::soft_delete_whiteboard(conn, id, actor)
}
