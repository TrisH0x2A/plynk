use rusqlite::{params, Connection};
use uuid::Uuid;
use crate::errors::{AppError, AppResult};
use crate::models::card::{Card, CardOrderItem};
use crate::services::activity::create_audit_log_with_user;
use crate::services::board::get_board;

pub fn get_card_by_id(conn: &Connection, id: &str) -> AppResult<Card> {
    let card = conn.query_row(
        "SELECT id, list_id, title, order_idx, description, status, labels, created_at, updated_at FROM cards WHERE id = ?1",
        params![id],
        |row| {
            Ok(Card {
                id: row.get(0)?,
                list_id: row.get(1)?,
                title: row.get(2)?,
                order_idx: row.get(3)?,
                description: row.get(4)?,
                status: row.get(5)?,
                labels: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        },
    ).map_err(|_| AppError::NotFound(format!("Card {} not found", id)))?;

    Ok(card)
}

pub fn create_card(conn: &Connection, list_id: &str, title: String, user_name: Option<String>) -> AppResult<Card> {
    if title.trim().is_empty() {
        return Err(AppError::Validation("Card title cannot be empty".into()));
    }

    let board_id: String = conn.query_row(
        "SELECT board_id FROM lists WHERE id = ?1",
        params![list_id],
        |row| row.get(0),
    )?;
    let board = get_board(conn, &board_id)?;

    let max_order: i32 = conn.query_row(
        "SELECT COALESCE(MAX(order_idx), 0) FROM cards WHERE list_id = ?1",
        params![list_id],
        |row| row.get(0),
    )?;

    let id = Uuid::new_v4().to_string();
    let order_idx = max_order + 1;
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO cards (id, list_id, title, order_idx, description, status, labels, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        params![id, list_id, title, order_idx, None::<String>, "ACTIVE", "[]", now, now],
    )?;

    let actor = user_name.as_deref().unwrap_or("SYS_ADMIN");
    create_audit_log_with_user(conn, &board.workspace_id, "CREATE", &id, "CARD", &title, actor)?;

    Ok(Card {
        id,
        list_id: list_id.to_string(),
        title,
        order_idx,
        description: None,
        status: Some("ACTIVE".to_string()),
        labels: Some("[]".to_string()),
        created_at: now.clone(),
        updated_at: now,
    })
}

pub fn update_card(
    conn: &Connection,
    id: &str,
    title: Option<String>,
    description: Option<String>,
    status: Option<String>,
    labels: Option<String>,
    user_name: Option<String>,
) -> AppResult<Card> {
    let existing = get_card_by_id(conn, id)?;
    let now = chrono::Utc::now().to_rfc3339();

    let new_title = title.unwrap_or(existing.title.clone());
    let new_desc = description.or(existing.description.clone());
    let new_status = status.clone().or(existing.status.clone()).unwrap_or_else(|| "ACTIVE".to_string());
    let new_labels = labels.clone().or(existing.labels.clone()).unwrap_or_else(|| "[]".to_string());

    conn.execute(
        "UPDATE cards SET title = ?1, description = ?2, status = ?3, labels = ?4, updated_at = ?5 WHERE id = ?6",
        params![new_title, new_desc, new_status, new_labels, now, id],
    )?;

    let board_id: String = conn.query_row(
        "SELECT board_id FROM lists WHERE id = ?1",
        params![existing.list_id],
        |row| row.get(0),
    )?;
    let board = get_board(conn, &board_id)?;
    let actor = user_name.as_deref().unwrap_or("SYS_ADMIN");

    // Dynamic specific action logging
    if let Some(ref s) = status {
        if existing.status.as_deref() != Some(s) {
            let action_type = format!("STATUS_{}", s);
            create_audit_log_with_user(conn, &board.workspace_id, &action_type, id, "CARD", &new_title, actor)?;
            return get_card_by_id(conn, id);
        }
    }

    if let Some(ref l) = labels {
        if existing.labels.as_deref() != Some(l) {
            let action_type = format!("LABELS_UPDATED:{}", l);
            create_audit_log_with_user(conn, &board.workspace_id, &action_type, id, "CARD", &new_title, actor)?;
            return get_card_by_id(conn, id);
        }
    }

    if new_title != existing.title {
        create_audit_log_with_user(conn, &board.workspace_id, "RENAMED", id, "CARD", &new_title, actor)?;
        return get_card_by_id(conn, id);
    }

    if new_desc != existing.description {
        create_audit_log_with_user(conn, &board.workspace_id, "DESC_UPDATED", id, "CARD", &new_title, actor)?;
        return get_card_by_id(conn, id);
    }

    create_audit_log_with_user(conn, &board.workspace_id, "UPDATE", id, "CARD", &new_title, actor)?;

    get_card_by_id(conn, id)
}

pub fn delete_card(conn: &Connection, id: &str, user_name: Option<String>) -> AppResult<()> {
    let existing = get_card_by_id(conn, id)?;

    let board_id: String = conn.query_row(
        "SELECT board_id FROM lists WHERE id = ?1",
        params![existing.list_id],
        |row| row.get(0),
    )?;
    let board = get_board(conn, &board_id)?;
    let actor = user_name.as_deref().unwrap_or("SYS_ADMIN");

    conn.execute("DELETE FROM cards WHERE id = ?1", params![id])?;

    create_audit_log_with_user(
        conn,
        &board.workspace_id,
        "DELETE",
        id,
        "CARD",
        &existing.title,
        actor,
    )?;

    Ok(())
}

pub fn update_card_order(conn: &Connection, items: Vec<CardOrderItem>) -> AppResult<()> {
    let tx = conn.unchecked_transaction()?;
    let now = chrono::Utc::now().to_rfc3339();

    for item in items {
        tx.execute(
            "UPDATE cards SET order_idx = ?1, list_id = ?2, updated_at = ?3 WHERE id = ?4",
            params![item.order_idx, item.list_id, now, item.id],
        )?;
    }

    tx.commit()?;
    Ok(())
}

pub fn copy_card(conn: &Connection, card_id: &str, user_name: Option<String>) -> AppResult<Card> {
    let original = get_card_by_id(conn, card_id)?;
    let new_title = format!("{} - Copy", original.title);
    
    create_card(conn, &original.list_id, new_title, user_name)
}
