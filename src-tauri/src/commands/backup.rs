use std::path::PathBuf;
use tauri::State;
use crate::errors::AppResult;
use crate::services::backup as backup_service;
use crate::state::AppState;

#[tauri::command]
pub fn export_database(state: State<'_, AppState>, target_path: String) -> AppResult<()> {
    let target = PathBuf::from(target_path);
    backup_service::export_database_backup(&state.db_path, &target)
}

#[tauri::command]
pub fn restore_database(state: State<'_, AppState>, source_path: String) -> AppResult<()> {
    let source = PathBuf::from(source_path);
    backup_service::restore_database_backup(&state.db_path, &source)
}

#[tauri::command]
pub fn open_external_url(url: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(["/c", "start", "", &url])
            .spawn()
            .map_err(|e| e.to_string())?;
        Ok(())
    }
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&url)
            .spawn()
            .map_err(|e| e.to_string())?;
        Ok(())
    }
    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        std::process::Command::new("xdg-open")
            .arg(&url)
            .spawn()
            .map_err(|e| e.to_string())?;
        Ok(())
    }
}
