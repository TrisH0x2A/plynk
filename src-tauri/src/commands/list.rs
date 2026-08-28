use tauri::State;
use crate::errors::AppResult;
use crate::models::card::ListOrderItem;
use crate::models::list::{List, ListWithCards};
use crate::services::list as list_service;
use crate::state::AppState;

#[tauri::command]
pub fn get_lists_by_board(
    state: State<'_, AppState>,
    board_id: String,
) -> AppResult<Vec<ListWithCards>> {
    let conn = state.db.lock().unwrap();
    list_service::get_lists_by_board(&conn, &board_id)
}

#[tauri::command]
pub fn create_list(
    state: State<'_, AppState>,
    board_id: String,
    title: String,
) -> AppResult<List> {
    let conn = state.db.lock().unwrap();
    list_service::create_list(&conn, &board_id, title)
}

#[tauri::command]
pub fn update_list(state: State<'_, AppState>, id: String, title: String) -> AppResult<List> {
    let conn = state.db.lock().unwrap();
    list_service::update_list(&conn, &id, title)
}

#[tauri::command]
pub fn delete_list(state: State<'_, AppState>, id: String) -> AppResult<()> {
    let conn = state.db.lock().unwrap();
    list_service::delete_list(&conn, &id)
}

#[tauri::command]
pub fn update_list_order(
    state: State<'_, AppState>,
    items: Vec<ListOrderItem>,
) -> AppResult<()> {
    let conn = state.db.lock().unwrap();
    list_service::update_list_order(&conn, items)
}
