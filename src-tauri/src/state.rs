use std::sync::Mutex;
use rusqlite::Connection;

pub struct AppState {
    pub db: Mutex<Connection>,
    pub db_path: std::path::PathBuf,
}

impl AppState {
    pub fn new(db: Connection, db_path: std::path::PathBuf) -> Self {
        Self {
            db: Mutex::new(db),
            db_path,
        }
    }
}
