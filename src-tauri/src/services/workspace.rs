use rusqlite::{params, Connection};
use uuid::Uuid;
use crate::errors::{AppError, AppResult};
use crate::models::workspace::Workspace;

pub fn get_workspaces(conn: &Connection) -> AppResult<Vec<Workspace>> {
    let mut stmt = conn.prepare(
        "SELECT id, name, slug, image_url, created_at, updated_at FROM workspaces ORDER BY created_at ASC",
    )?;
    
    let rows = stmt.query_map([], |row| {
        Ok(Workspace {
            id: row.get(0)?,
            name: row.get(1)?,
            slug: row.get(2)?,
            image_url: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    })?;

    let mut result = Vec::new();
    for row in rows {
        result.push(row?);
    }
    Ok(result)
}

pub fn create_workspace(conn: &Connection, name: String) -> AppResult<Workspace> {
    if name.trim().is_empty() {
        return Err(AppError::Validation("Workspace name cannot be empty".into()));
    }

    let id = Uuid::new_v4().to_string();
    let slug = format!("{}-{}", name.to_lowercase().replace(' ', "-"), &id[..8]);
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO workspaces (id, name, slug, image_url, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![id, name, slug, "", now, now],
    )?;

    Ok(Workspace {
        id,
        name,
        slug,
        image_url: Some("".into()),
        created_at: now.clone(),
        updated_at: now,
    })
}

pub fn delete_workspace(conn: &Connection, id: &str, user_name: Option<String>) -> AppResult<()> {
    let actor = user_name.unwrap_or_else(|| "SYS_ADMIN".to_string());
    crate::services::recycle_bin::soft_delete_workspace(conn, id, &actor)
}
