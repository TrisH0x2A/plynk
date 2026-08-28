use tauri::State;
use crate::errors::AppResult;
use crate::models::recycle_bin::RecycleBinItem;
use crate::services::recycle_bin as bin_service;
use crate::state::AppState;

#[tauri::command]
pub fn get_recycle_bin(state: State<'_, AppState>) -> AppResult<Vec<RecycleBinItem>> {
    let conn = state.db.lock().map_err(|e| crate::errors::AppError::Validation(e.to_string()))?;
    bin_service::get_recycle_bin_items(&conn)
}

#[tauri::command]
pub fn restore_bin_item(state: State<'_, AppState>, id: String) -> AppResult<()> {
    let conn = state.db.lock().map_err(|e| crate::errors::AppError::Validation(e.to_string()))?;
    bin_service::restore_item(&conn, &id)
}

#[tauri::command]
pub fn restore_all_bin_items(state: State<'_, AppState>) -> AppResult<()> {
    let conn = state.db.lock().map_err(|e| crate::errors::AppError::Validation(e.to_string()))?;
    bin_service::restore_all_items(&conn)
}

#[tauri::command]
pub fn delete_bin_item_permanently(state: State<'_, AppState>, id: String) -> AppResult<()> {
    let conn = state.db.lock().map_err(|e| crate::errors::AppError::Validation(e.to_string()))?;
    bin_service::delete_permanently(&conn, &id)
}

#[tauri::command]
pub fn clear_recycle_bin(state: State<'_, AppState>) -> AppResult<()> {
    let conn = state.db.lock().map_err(|e| crate::errors::AppError::Validation(e.to_string()))?;
    bin_service::clear_all(&conn)
}
