use serde::{Deserialize, Serialize};
use super::card::Card;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct List {
    pub id: String,
    pub board_id: String,
    pub title: String,
    pub order_idx: i32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ListWithCards {
    #[serde(flatten)]
    pub list: List,
    pub cards: Vec<Card>,
}
