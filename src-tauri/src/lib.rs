pub mod commands;
pub mod db;
pub mod errors;
pub mod models;
pub mod services;
pub mod state;

use state::AppState;
use tauri::Manager;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let app_dir = app
                .path()
                .app_data_dir()
                .unwrap_or_else(|_| std::path::PathBuf::from("."));
            
            std::fs::create_dir_all(&app_dir).ok();
            let db_path = app_dir.join("plynk.db");
            
            let conn = db::init_db(&db_path).expect("Failed to initialize SQLite database");

            app.manage(AppState::new(conn, db_path));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::workspace::get_workspaces,
            commands::workspace::create_workspace,
            commands::workspace::delete_workspace,
            commands::board::get_boards_by_workspace,
            commands::board::get_board,
            commands::board::create_board,
            commands::board::update_board,
            commands::board::delete_board,
            commands::list::get_lists_by_board,
            commands::list::create_list,
            commands::list::update_list,
            commands::list::delete_list,
            commands::list::update_list_order,
            commands::card::get_card_by_id,
            commands::card::create_card,
            commands::card::update_card,
            commands::card::delete_card,
            commands::card::update_card_order,
            commands::card::copy_card,
            commands::activity::get_audit_logs_by_workspace,
            commands::activity::get_audit_logs_by_entity,
            commands::backup::export_database,
            commands::backup::restore_database,
            commands::backup::open_external_url,
            commands::recycle_bin::get_recycle_bin,
            commands::recycle_bin::restore_bin_item,
            commands::recycle_bin::restore_all_bin_items,
            commands::recycle_bin::delete_bin_item_permanently,
            commands::recycle_bin::clear_recycle_bin,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
