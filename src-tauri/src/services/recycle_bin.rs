use rusqlite::{params, Connection};
use uuid::Uuid;
use serde::{Deserialize, Serialize};
use serde_json::json;
use crate::errors::{AppError, AppResult};
use crate::models::recycle_bin::RecycleBinItem;
use crate::models::workspace::Workspace;
use crate::models::board::Board;
use crate::models::list::List;
use crate::models::card::Card;

#[derive(Serialize, Deserialize, Clone)]
pub struct StoredWorkspacePayload {
    pub workspace: Workspace,
    pub boards: Vec<StoredBoardPayload>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct StoredBoardPayload {
    pub board: Board,
    pub lists: Vec<StoredListPayload>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct StoredListPayload {
    pub list: List,
    pub cards: Vec<Card>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct StoredCardPayload {
    pub card: Card,
}

pub fn get_recycle_bin_items(conn: &Connection) -> AppResult<Vec<RecycleBinItem>> {
    let mut stmt = conn.prepare(
        "SELECT id, item_type, item_id, title, parent_workspace_id, parent_board_id, parent_list_id, payload, meta, actor, deleted_at 
         FROM recycle_bin ORDER BY deleted_at DESC"
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(RecycleBinItem {
            id: row.get(0)?,
            item_type: row.get(1)?,
            item_id: row.get(2)?,
            title: row.get(3)?,
            parent_workspace_id: row.get(4)?,
            parent_board_id: row.get(5)?,
            parent_list_id: row.get(6)?,
            payload: row.get(7)?,
            meta: row.get(8)?,
            actor: row.get(9)?,
            deleted_at: row.get(10)?,
        })
    })?;

    let mut items = Vec::new();
    for row in rows {
        items.push(row?);
    }
    Ok(items)
}

pub fn soft_delete_workspace(conn: &Connection, id: &str, actor: &str) -> AppResult<()> {
    let ws: Workspace = conn.query_row(
        "SELECT id, name, slug, image_url, created_at, updated_at FROM workspaces WHERE id = ?1",
        params![id],
        |row| {
            Ok(Workspace {
                id: row.get(0)?,
                name: row.get(1)?,
                slug: row.get(2)?,
                image_url: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        },
    ).map_err(|_| AppError::NotFound(format!("Workspace {} not found", id)))?;

    let mut boards_payload = Vec::new();
    let mut board_breakdown = Vec::new();
    let mut total_cards = 0;

    let mut b_stmt = conn.prepare(
        "SELECT id, workspace_id, title, image_id, image_thumb_url, image_full_url, image_user_name, image_link_html, is_favorite, created_at, updated_at 
         FROM boards WHERE workspace_id = ?1",
    )?;

    let board_rows = b_stmt.query_map(params![id], |row| {
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

    for b in board_rows.filter_map(Result::ok) {
        let mut lists_payload = Vec::new();
        let mut l_stmt = conn.prepare("SELECT id, board_id, title, order_idx, created_at, updated_at FROM lists WHERE board_id = ?1")?;
        let list_rows = l_stmt.query_map(params![&b.id], |row| {
            Ok(List {
                id: row.get(0)?,
                board_id: row.get(1)?,
                title: row.get(2)?,
                order_idx: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        })?;

        let mut board_card_count = 0;
        for l in list_rows.filter_map(Result::ok) {
            let mut c_stmt = conn.prepare("SELECT id, list_id, title, order_idx, description, status, labels, created_at, updated_at FROM cards WHERE list_id = ?1")?;
            let card_rows = c_stmt.query_map(params![&l.id], |row| {
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

            let cards: Vec<Card> = card_rows.filter_map(Result::ok).collect();
            board_card_count += cards.len();
            total_cards += cards.len();
            lists_payload.push(StoredListPayload { list: l, cards });
        }

        board_breakdown.push(json!({
            "title": b.title,
            "card_count": board_card_count
        }));

        boards_payload.push(StoredBoardPayload {
            board: b,
            lists: lists_payload,
        });
    }

    let payload = serde_json::to_string(&StoredWorkspacePayload {
        workspace: ws.clone(),
        boards: boards_payload,
    })?;

    let meta = json!({
        "board_count": board_breakdown.len(),
        "card_count": total_cards,
        "boards": board_breakdown
    }).to_string();

    let bin_id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO recycle_bin (id, item_type, item_id, title, parent_workspace_id, parent_board_id, parent_list_id, payload, meta, actor, deleted_at)
         VALUES (?1, 'WORKSPACE', ?2, ?3, NULL, NULL, NULL, ?4, ?5, ?6, ?7)",
        params![bin_id, ws.id, ws.name, payload, meta, actor, now],
    )?;

    conn.execute("DELETE FROM workspaces WHERE id = ?1", params![id])?;

    Ok(())
}

pub fn soft_delete_board(conn: &Connection, id: &str, actor: &str) -> AppResult<()> {
    let b: Board = conn.query_row(
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

    let mut lists_payload = Vec::new();
    let mut total_cards = 0;

    let mut l_stmt = conn.prepare("SELECT id, board_id, title, order_idx, created_at, updated_at FROM lists WHERE board_id = ?1")?;
    let list_rows = l_stmt.query_map(params![id], |row| {
        Ok(List {
            id: row.get(0)?,
            board_id: row.get(1)?,
            title: row.get(2)?,
            order_idx: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    })?;

    for l in list_rows.filter_map(Result::ok) {
        let mut c_stmt = conn.prepare("SELECT id, list_id, title, order_idx, description, status, labels, created_at, updated_at FROM cards WHERE list_id = ?1")?;
        let card_rows = c_stmt.query_map(params![&l.id], |row| {
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

        let cards: Vec<Card> = card_rows.filter_map(Result::ok).collect();
        total_cards += cards.len();
        lists_payload.push(StoredListPayload { list: l, cards });
    }

    let payload = serde_json::to_string(&StoredBoardPayload {
        board: b.clone(),
        lists: lists_payload.clone(),
    })?;

    let meta = json!({
        "card_count": total_cards,
        "list_count": lists_payload.len()
    }).to_string();

    let bin_id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO recycle_bin (id, item_type, item_id, title, parent_workspace_id, parent_board_id, parent_list_id, payload, meta, actor, deleted_at)
         VALUES (?1, 'BOARD', ?2, ?3, ?4, NULL, NULL, ?5, ?6, ?7, ?8)",
        params![bin_id, b.id, b.title, b.workspace_id, payload, meta, actor, now],
    )?;

    conn.execute("DELETE FROM boards WHERE id = ?1", params![id])?;

    Ok(())
}

pub fn soft_delete_card(conn: &Connection, id: &str, actor: &str) -> AppResult<()> {
    let c: Card = conn.query_row(
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

    let list_title: String = conn.query_row(
        "SELECT title FROM lists WHERE id = ?1",
        params![&c.list_id],
        |row| row.get(0),
    ).unwrap_or_else(|_| "List".to_string());

    let payload = serde_json::to_string(&StoredCardPayload { card: c.clone() })?;

    let meta = json!({
        "status": c.status.as_deref().unwrap_or("ACTIVE"),
        "labels": c.labels.as_deref().unwrap_or("[]"),
        "list_title": list_title
    }).to_string();

    let bin_id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO recycle_bin (id, item_type, item_id, title, parent_workspace_id, parent_board_id, parent_list_id, payload, meta, actor, deleted_at)
         VALUES (?1, 'CARD', ?2, ?3, NULL, NULL, ?4, ?5, ?6, ?7, ?8)",
        params![bin_id, c.id, c.title, c.list_id, payload, meta, actor, now],
    )?;

    conn.execute("DELETE FROM cards WHERE id = ?1", params![id])?;

    Ok(())
}

pub fn restore_item(conn: &Connection, id: &str) -> AppResult<()> {
    let item: RecycleBinItem = conn.query_row(
        "SELECT id, item_type, item_id, title, parent_workspace_id, parent_board_id, parent_list_id, payload, meta, actor, deleted_at 
         FROM recycle_bin WHERE id = ?1",
        params![id],
        |row| {
            Ok(RecycleBinItem {
                id: row.get(0)?,
                item_type: row.get(1)?,
                item_id: row.get(2)?,
                title: row.get(3)?,
                parent_workspace_id: row.get(4)?,
                parent_board_id: row.get(5)?,
                parent_list_id: row.get(6)?,
                payload: row.get(7)?,
                meta: row.get(8)?,
                actor: row.get(9)?,
                deleted_at: row.get(10)?,
            })
        },
    ).map_err(|_| AppError::NotFound(format!("Recycle bin item {} not found", id)))?;

    if item.item_type == "WORKSPACE" {
        let ws_data: StoredWorkspacePayload = serde_json::from_str(&item.payload)?;
        let ws = ws_data.workspace;

        conn.execute(
            "INSERT OR REPLACE INTO workspaces (id, name, slug, image_url, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![ws.id, ws.name, ws.slug, ws.image_url.unwrap_or_default(), ws.created_at, ws.updated_at],
        )?;

        for b_data in ws_data.boards {
            let b = b_data.board;
            conn.execute(
                "INSERT OR REPLACE INTO boards (id, workspace_id, title, image_id, image_thumb_url, image_full_url, image_user_name, image_link_html, is_favorite, created_at, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
                params![b.id, ws.id, b.title, b.image_id, b.image_thumb_url, b.image_full_url, b.image_user_name, b.image_link_html, if b.is_favorite { 1 } else { 0 }, b.created_at, b.updated_at],
            )?;

            for l_data in b_data.lists {
                let l = l_data.list;
                conn.execute(
                    "INSERT OR REPLACE INTO lists (id, board_id, title, order_idx, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                    params![l.id, b.id, l.title, l.order_idx, l.created_at, l.updated_at],
                )?;

                for c in l_data.cards {
                    conn.execute(
                        "INSERT OR REPLACE INTO cards (id, list_id, title, order_idx, description, status, labels, created_at, updated_at)
                         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
                        params![c.id, l.id, c.title, c.order_idx, c.description.unwrap_or_default(), c.status.unwrap_or_else(|| "ACTIVE".into()), c.labels.unwrap_or_else(|| "[]".into()), c.created_at, c.updated_at],
                    )?;
                }
            }
        }
    } else if item.item_type == "BOARD" {
        let b_data: StoredBoardPayload = serde_json::from_str(&item.payload)?;
        let b = b_data.board;

        let ws_exists: i64 = conn.query_row("SELECT COUNT(*) FROM workspaces WHERE id = ?1", params![&b.workspace_id], |r| r.get(0)).unwrap_or(0);
        let target_ws_id = if ws_exists > 0 {
            b.workspace_id.clone()
        } else {
            conn.query_row("SELECT id FROM workspaces LIMIT 1", [], |r| r.get(0)).unwrap_or_else(|_| "".into())
        };

        if !target_ws_id.is_empty() {
            conn.execute(
                "INSERT OR REPLACE INTO boards (id, workspace_id, title, image_id, image_thumb_url, image_full_url, image_user_name, image_link_html, is_favorite, created_at, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
                params![b.id, target_ws_id, b.title, b.image_id, b.image_thumb_url, b.image_full_url, b.image_user_name, b.image_link_html, if b.is_favorite { 1 } else { 0 }, b.created_at, b.updated_at],
            )?;

            for l_data in b_data.lists {
                let l = l_data.list;
                conn.execute(
                    "INSERT OR REPLACE INTO lists (id, board_id, title, order_idx, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                    params![l.id, b.id, l.title, l.order_idx, l.created_at, l.updated_at],
                )?;

                for c in l_data.cards {
                    conn.execute(
                        "INSERT OR REPLACE INTO cards (id, list_id, title, order_idx, description, status, labels, created_at, updated_at)
                         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
                        params![c.id, l.id, c.title, c.order_idx, c.description.unwrap_or_default(), c.status.unwrap_or_else(|| "ACTIVE".into()), c.labels.unwrap_or_else(|| "[]".into()), c.created_at, c.updated_at],
                    )?;
                }
            }
        }
    } else if item.item_type == "CARD" {
        let c_data: StoredCardPayload = serde_json::from_str(&item.payload)?;
        let c = c_data.card;

        let list_exists: i64 = conn.query_row("SELECT COUNT(*) FROM lists WHERE id = ?1", params![&c.list_id], |r| r.get(0)).unwrap_or(0);
        let target_list_id = if list_exists > 0 {
            c.list_id.clone()
        } else {
            conn.query_row("SELECT id FROM lists LIMIT 1", [], |r| r.get(0)).unwrap_or_else(|_| "".into())
        };

        if !target_list_id.is_empty() {
            conn.execute(
                "INSERT OR REPLACE INTO cards (id, list_id, title, order_idx, description, status, labels, created_at, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
                params![c.id, target_list_id, c.title, c.order_idx, c.description.unwrap_or_default(), c.status.unwrap_or_else(|| "ACTIVE".into()), c.labels.unwrap_or_else(|| "[]".into()), c.created_at, c.updated_at],
            )?;
        }
    }

    conn.execute("DELETE FROM recycle_bin WHERE id = ?1", params![id])?;

    Ok(())
}

pub fn restore_all_items(conn: &Connection) -> AppResult<()> {
    let items = get_recycle_bin_items(conn)?;
    let mut workspaces = Vec::new();
    let mut boards = Vec::new();
    let mut cards = Vec::new();

    for it in items {
        if it.item_type == "WORKSPACE" {
            workspaces.push(it);
        } else if it.item_type == "BOARD" {
            boards.push(it);
        } else {
            cards.push(it);
        }
    }

    for ws in workspaces {
        let _ = restore_item(conn, &ws.id);
    }
    for b in boards {
        let _ = restore_item(conn, &b.id);
    }
    for c in cards {
        let _ = restore_item(conn, &c.id);
    }

    Ok(())
}

pub fn delete_permanently(conn: &Connection, id: &str) -> AppResult<()> {
    conn.execute("DELETE FROM recycle_bin WHERE id = ?1", params![id])?;
    Ok(())
}

pub fn clear_all(conn: &Connection) -> AppResult<()> {
    conn.execute("DELETE FROM recycle_bin", [])?;
    Ok(())
}
