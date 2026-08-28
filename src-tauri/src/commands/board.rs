use tauri::State;
use crate::errors::AppResult;
use crate::models::board::Board;
use crate::services::board as board_service;
use crate::state::AppState;

#[tauri::command]
pub fn get_boards_by_workspace(
    state: State<'_, AppState>,
    workspace_id: String,
) -> AppResult<Vec<Board>> {
    let conn = state.db.lock().unwrap();
    board_service::get_boards_by_workspace(&conn, &workspace_id)
}

#[tauri::command]
pub fn get_board(state: State<'_, AppState>, id: String) -> AppResult<Board> {
    let conn = state.db.lock().unwrap();
    board_service::get_board(&conn, &id)
}

#[tauri::command]
pub fn create_board(
    state: State<'_, AppState>,
    workspace_id: String,
    title: String,
    image: String,
    user_name: Option<String>,
) -> AppResult<Board> {
    let conn = state.db.lock().unwrap();
    board_service::create_board(&conn, &workspace_id, title, image, user_name)
}

#[tauri::command]
pub fn update_board(
    state: State<'_, AppState>,
    id: String,
    title: String,
    user_name: Option<String>,
) -> AppResult<Board> {
    let conn = state.db.lock().unwrap();
    board_service::update_board(&conn, &id, title, user_name)
}

#[tauri::command]
pub fn delete_board(
    state: State<'_, AppState>,
    id: String,
    user_name: Option<String>,
) -> AppResult<()> {
    let conn = state.db.lock().unwrap();
    board_service::delete_board(&conn, &id, user_name)
}
