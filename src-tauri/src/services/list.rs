use rusqlite::{params, Connection};
use uuid::Uuid;
use crate::errors::{AppError, AppResult};
use crate::models::card::Card;
use crate::models::list::{List, ListWithCards};
use crate::services::activity::create_audit_log;
use crate::services::board::get_board;

pub fn get_lists_by_board(conn: &Connection, board_id: &str) -> AppResult<Vec<ListWithCards>> {
    let mut list_stmt = conn.prepare(
        "SELECT id, board_id, title, order_idx, created_at, updated_at FROM lists WHERE board_id = ?1 ORDER BY order_idx ASC",
    )?;

    let list_rows = list_stmt.query_map(params![board_id], |row| {
        Ok(List {
            id: row.get(0)?,
            board_id: row.get(1)?,
            title: row.get(2)?,
            order_idx: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    })?;

    let mut result = Vec::new();
    for list_res in list_rows {
        let list = list_res?;
        
        let mut card_stmt = conn.prepare(
            "SELECT id, list_id, title, order_idx, description, status, labels, created_at, updated_at FROM cards WHERE list_id = ?1 ORDER BY order_idx ASC",
        )?;
        let card_rows = card_stmt.query_map(params![list.id], |row| {
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
        })?;

        let mut cards = Vec::new();
        for card_res in card_rows {
            cards.push(card_res?);
        }

        result.push(ListWithCards { list, cards });
    }

    Ok(result)
}

pub fn create_list(conn: &Connection, board_id: &str, title: String) -> AppResult<List> {
    if title.trim().is_empty() {
        return Err(AppError::Validation("List title cannot be empty".into()));
    }

    let board = get_board(conn, board_id)?;
    let max_order: i32 = conn.query_row(
        "SELECT COALESCE(MAX(order_idx), 0) FROM lists WHERE board_id = ?1",
        params![board_id],
        |row| row.get(0),
    )?;

    let id = Uuid::new_v4().to_string();
    let order_idx = max_order + 1;
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO lists (id, board_id, title, order_idx, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![id, board_id, title, order_idx, now, now],
    )?;

    create_audit_log(conn, &board.workspace_id, "CREATE", &id, "LIST", &title)?;

    Ok(List {
        id,
        board_id: board_id.to_string(),
        title,
        order_idx,
        created_at: now.clone(),
        updated_at: now,
    })
}

pub fn update_list(conn: &Connection, id: &str, title: String) -> AppResult<List> {
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "UPDATE lists SET title = ?1, updated_at = ?2 WHERE id = ?3",
        params![title, now, id],
    )?;

    let list: List = conn.query_row(
        "SELECT id, board_id, title, order_idx, created_at, updated_at FROM lists WHERE id = ?1",
        params![id],
        |row| {
            Ok(List {
                id: row.get(0)?,
                board_id: row.get(1)?,
                title: row.get(2)?,
                order_idx: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        },
    )?;

    let board = get_board(conn, &list.board_id)?;
    create_audit_log(conn, &board.workspace_id, "UPDATE", id, "LIST", &title)?;

    Ok(list)
}

pub fn delete_list(conn: &Connection, id: &str, user_name: Option<String>) -> AppResult<()> {
    let actor = user_name.as_deref().unwrap_or("SYS_ADMIN");
    crate::services::recycle_bin::soft_delete_list(conn, id, actor)
}

pub fn update_list_order(
    conn: &Connection,
    items: Vec<crate::models::card::ListOrderItem>,
) -> AppResult<()> {
    let tx = conn.unchecked_transaction()?;
    let now = chrono::Utc::now().to_rfc3339();

    for item in items {
        tx.execute(
            "UPDATE lists SET order_idx = ?1, updated_at = ?2 WHERE id = ?3",
            params![item.order_idx, now, item.id],
        )?;
    }

    tx.commit()?;
    Ok(())
}
