pub mod migrations;

use rusqlite::Connection;
use std::path::Path;
use crate::errors::AppResult;

pub fn init_db<P: AsRef<Path>>(path: P) -> AppResult<Connection> {
    if let Some(parent) = path.as_ref().parent() {
        std::fs::create_dir_all(parent)?;
    }

    let conn = Connection::open(path)?;
    migrations::run_migrations(&conn)?;
    Ok(conn)
}
