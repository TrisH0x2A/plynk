use std::fs;
use std::path::Path;
use rusqlite::Connection;
use crate::errors::{AppError, AppResult};

pub fn export_database_backup(conn: &Connection, target_path: &Path) -> AppResult<()> {
    // Checkpoint WAL first so all data is flushed
    let _ = conn.execute_batch("PRAGMA wal_checkpoint(TRUNCATE);");

    if target_path.exists() {
        let _ = fs::remove_file(target_path);
    }

    let target_str = target_path.to_string_lossy();
    let sanitized = target_str.replace("'", "''");
    conn.execute(&format!("VACUUM INTO '{}'", sanitized), [])?;

    Ok(())
}

pub fn restore_database_backup(
    conn: &mut Connection,
    db_path: &Path,
    source_path: &Path,
) -> AppResult<()> {
    if !source_path.exists() {
        return Err(AppError::NotFound("Source backup file does not exist".into()));
    }

    // 1. Truncate existing connection WAL
    let _ = conn.execute_batch("PRAGMA wal_checkpoint(TRUNCATE);");

    // 2. Open source database to verify it is a valid SQLite DB and flush any source WAL
    {
        let src_conn = Connection::open(source_path)
            .map_err(|e| AppError::Validation(format!("Invalid SQLite backup file: {}", e)))?;
        let _ = src_conn.execute_batch("PRAGMA wal_checkpoint(TRUNCATE);");
    }

    // 3. Remove old WAL and SHM files
    let wal_path = db_path.with_file_name(format!(
        "{}-wal",
        db_path.file_name().unwrap_or_default().to_string_lossy()
    ));
    let shm_path = db_path.with_file_name(format!(
        "{}-shm",
        db_path.file_name().unwrap_or_default().to_string_lossy()
    ));

    let _ = fs::remove_file(&wal_path);
    let _ = fs::remove_file(&shm_path);

    // 4. Overwrite main database file
    fs::copy(source_path, db_path)?;

    // 5. Reinitialize active connection
    *conn = crate::db::init_db(db_path)?;

    Ok(())
}
