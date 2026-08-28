use std::fs;
use std::path::Path;
use crate::errors::{AppError, AppResult};

pub fn export_database_backup(db_path: &Path, target_path: &Path) -> AppResult<()> {
    fs::copy(db_path, target_path)?;
    Ok(())
}

pub fn restore_database_backup(db_path: &Path, source_path: &Path) -> AppResult<()> {
    if !source_path.exists() {
        return Err(AppError::NotFound("Source backup file does not exist".into()));
    }
    fs::copy(source_path, db_path)?;
    Ok(())
}
