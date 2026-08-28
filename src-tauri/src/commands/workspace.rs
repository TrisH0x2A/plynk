use tauri::State;
use crate::errors::AppResult;
use crate::models::workspace::Workspace;
use crate::services::workspace as workspace_service;
use crate::state::AppState;

#[tauri::command]
pub fn get_workspaces(state: State<'_, AppState>) -> AppResult<Vec<Workspace>> {
    let conn = state.db.lock().unwrap();
    workspace_service::get_workspaces(&conn)
}

#[tauri::command]
pub fn create_workspace(state: State<'_, AppState>, name: String) -> AppResult<Workspace> {
    let conn = state.db.lock().unwrap();
    workspace_service::create_workspace(&conn, name)
}

#[tauri::command]
pub fn delete_workspace(state: State<'_, AppState>, id: String) -> AppResult<()> {
    let conn = state.db.lock().unwrap();
    workspace_service::delete_workspace(&conn, &id)
}
