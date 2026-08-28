use rusqlite::{params, Connection};
use uuid::Uuid;
use crate::errors::{AppError, AppResult};
use crate::models::board::Board;
use crate::services::activity::create_audit_log_with_user;

pub fn get_boards_by_workspace(conn: &Connection, workspace_id: &str) -> AppResult<Vec<Board>> {
    let mut stmt = conn.prepare(
        "SELECT id, workspace_id, title, image_id, image_thumb_url, image_full_url, image_user_name, image_link_html, is_favorite, created_at, updated_at 
         FROM boards WHERE workspace_id = ?1 ORDER BY created_at DESC",
    )?;

    let rows = stmt.query_map(params![workspace_id], |row| {
        Ok(Board {
            id: row.get(0)?,
            workspace_id: row.get(1)?,
            title: row.get(2)?,
            image_id: row.get(3)?,
            image_thumb_url: row.get(4)?,
            image_full_url: row.get(5)?,
            image_user_name: row.get(6)?,
            image_link_html: row.get(7)?,
            is_favorite: row.get::<_, i32>(8)? != 0,
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
        })
    })?;

    let mut result = Vec::new();
    for row in rows {
        result.push(row?);
    }
    Ok(result)
}

pub fn get_board(conn: &Connection, id: &str) -> AppResult<Board> {
    let board = conn.query_row(
        "SELECT id, workspace_id, title, image_id, image_thumb_url, image_full_url, image_user_name, image_link_html, is_favorite, created_at, updated_at 
         FROM boards WHERE id = ?1",
        params![id],
        |row| {
            Ok(Board {
                id: row.get(0)?,
                workspace_id: row.get(1)?,
                title: row.get(2)?,
                image_id: row.get(3)?,
                image_thumb_url: row.get(4)?,
                image_full_url: row.get(5)?,
                image_user_name: row.get(6)?,
                image_link_html: row.get(7)?,
                is_favorite: row.get::<_, i32>(8)? != 0,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        },
    ).map_err(|_| AppError::NotFound(format!("Board {} not found", id)))?;

    Ok(board)
}

pub fn create_board(
    conn: &Connection,
    workspace_id: &str,
    title: String,
    image: String,
    user_name: Option<String>,
) -> AppResult<Board> {
    if title.trim().is_empty() {
        return Err(AppError::Validation("Board title cannot be empty".into()));
    }

    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    let parts: Vec<&str> = image.split('|').collect();
    let (img_id, thumb, full, user, link) = if parts.len() >= 5 {
        (parts[0], parts[1], parts[2], parts[3], parts[4])
    } else {
        (image.as_str(), image.as_str(), image.as_str(), "SYS_ADMIN", "")
    };

    conn.execute(
        "INSERT INTO boards (id, workspace_id, title, image_id, image_thumb_url, image_full_url, image_user_name, image_link_html, is_favorite, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        params![id, workspace_id, title, img_id, thumb, full, user, link, 0, now, now],
    )?;

    let actor = user_name.as_deref().unwrap_or("SYS_ADMIN");
    create_audit_log_with_user(conn, workspace_id, "CREATE", &id, "BOARD", &title, actor)?;

    get_board(conn, &id)
}

pub fn update_board(conn: &Connection, id: &str, title: String, user_name: Option<String>) -> AppResult<Board> {
    let existing = get_board(conn, id)?;
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "UPDATE boards SET title = ?1, updated_at = ?2 WHERE id = ?3",
        params![title, now, id],
    )?;

    let actor = user_name.as_deref().unwrap_or("SYS_ADMIN");
    create_audit_log_with_user(conn, &existing.workspace_id, "UPDATE", id, "BOARD", &title, actor)?;

    get_board(conn, id)
}

pub fn delete_board(conn: &Connection, id: &str, user_name: Option<String>) -> AppResult<()> {
    let actor = user_name.as_deref().unwrap_or("SYS_ADMIN");
    crate::services::recycle_bin::soft_delete_board(conn, id, actor)
}
