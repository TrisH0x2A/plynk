pub mod migrations;

use rusqlite::Connection;
use std::path::Path;
use crate::errors::AppResult;

pub fn init_db<P: AsRef<Path>>(path: P) -> AppResult<Connection> {
    let p = path.as_ref();
    if let Some(parent) = p.parent() {
        std::fs::create_dir_all(parent)?;
    }

    match Connection::open(p).and_then(|c| migrations::run_migrations(&c).map(|_| c)) {
        Ok(conn) => Ok(conn),
        Err(err) => {
            eprintln!("Initial DB open failed ({:?}), attempting WAL recovery...", err);
            let wal = p.with_file_name(format!("{}-wal", p.file_name().unwrap_or_default().to_string_lossy()));
            let shm = p.with_file_name(format!("{}-shm", p.file_name().unwrap_or_default().to_string_lossy()));
            let _ = std::fs::remove_file(&wal);
            let _ = std::fs::remove_file(&shm);

            let conn = Connection::open(p)?;
            migrations::run_migrations(&conn)?;
            Ok(conn)
        }
    }
}
