use tauri::State;
use crate::errors::AppResult;
use crate::models::card::{Card, CardOrderItem};
use crate::services::card as card_service;
use crate::state::AppState;

#[tauri::command]
pub fn get_card_by_id(state: State<'_, AppState>, id: String) -> AppResult<Card> {
    let conn = state.db.lock().unwrap();
    card_service::get_card_by_id(&conn, &id)
}

#[tauri::command]
pub fn create_card(
    state: State<'_, AppState>,
    list_id: String,
    title: String,
    user_name: Option<String>,
) -> AppResult<Card> {
    let conn = state.db.lock().unwrap();
    card_service::create_card(&conn, &list_id, title, user_name)
}

#[tauri::command]
pub fn update_card(
    state: State<'_, AppState>,
    id: String,
    title: Option<String>,
    description: Option<String>,
    status: Option<String>,
    labels: Option<String>,
    user_name: Option<String>,
) -> AppResult<Card> {
    let conn = state.db.lock().unwrap();
    card_service::update_card(&conn, &id, title, description, status, labels, user_name)
}

#[tauri::command]
pub fn delete_card(state: State<'_, AppState>, id: String, user_name: Option<String>) -> AppResult<()> {
    let conn = state.db.lock().unwrap();
    card_service::delete_card(&conn, &id, user_name)
}

#[tauri::command]
pub fn update_card_order(
    state: State<'_, AppState>,
    items: Vec<CardOrderItem>,
) -> AppResult<()> {
    let conn = state.db.lock().unwrap();
    card_service::update_card_order(&conn, items)
}

#[tauri::command]
pub fn copy_card(state: State<'_, AppState>, id: String, user_name: Option<String>) -> AppResult<Card> {
    let conn = state.db.lock().unwrap();
    card_service::copy_card(&conn, &id, user_name)
}
