use tauri::State;
use crate::errors::AppResult;
use crate::models::activity::AuditLog;
use crate::services::activity as activity_service;
use crate::state::AppState;

#[tauri::command]
pub fn get_audit_logs_by_workspace(
    state: State<'_, AppState>,
    workspace_id: String,
) -> AppResult<Vec<AuditLog>> {
    let conn = state.db.lock().unwrap();
    activity_service::get_audit_logs_by_workspace(&conn, &workspace_id)
}

#[tauri::command]
pub fn get_audit_logs_by_entity(
    state: State<'_, AppState>,
    entity_id: String,
) -> AppResult<Vec<AuditLog>> {
    let conn = state.db.lock().unwrap();
    activity_service::get_audit_logs_by_entity(&conn, &entity_id)
}
