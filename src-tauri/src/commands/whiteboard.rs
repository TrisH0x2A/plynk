use tauri::State;
use crate::errors::AppResult;
use crate::models::whiteboard::Whiteboard;
use crate::services::whiteboard as whiteboard_service;
use crate::state::AppState;

#[tauri::command]
pub fn get_whiteboards_by_workspace(
    state: State<'_, AppState>,
    workspace_id: String,
) -> AppResult<Vec<Whiteboard>> {
    let conn = state.db.lock().unwrap();
    whiteboard_service::get_whiteboards_by_workspace(&conn, &workspace_id)
}

#[tauri::command]
pub fn get_whiteboard(
    state: State<'_, AppState>,
    id: String,
) -> AppResult<Whiteboard> {
    let conn = state.db.lock().unwrap();
    whiteboard_service::get_whiteboard(&conn, &id)
}

#[tauri::command]
pub fn create_whiteboard(
    state: State<'_, AppState>,
    workspace_id: String,
    title: String,
    user_name: Option<String>,
) -> AppResult<Whiteboard> {
    let conn = state.db.lock().unwrap();
    whiteboard_service::create_whiteboard(&conn, &workspace_id, title, user_name)
}

#[tauri::command]
pub fn update_whiteboard(
    state: State<'_, AppState>,
    id: String,
    title: String,
    user_name: Option<String>,
) -> AppResult<Whiteboard> {
    let conn = state.db.lock().unwrap();
    whiteboard_service::update_whiteboard(&conn, &id, title, user_name)
}

#[tauri::command]
pub fn save_whiteboard_canvas(
    state: State<'_, AppState>,
    id: String,
    canvas_data: String,
) -> AppResult<()> {
    let conn = state.db.lock().unwrap();
    whiteboard_service::save_whiteboard_canvas(&conn, &id, canvas_data)
}

#[tauri::command]
pub fn delete_whiteboard(
    state: State<'_, AppState>,
    id: String,
    user_name: Option<String>,
) -> AppResult<()> {
    let conn = state.db.lock().unwrap();
    whiteboard_service::delete_whiteboard(&conn, &id, user_name)
}
