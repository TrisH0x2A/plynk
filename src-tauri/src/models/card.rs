use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Card {
    pub id: String,
    pub list_id: String,
    pub title: String,
    pub order_idx: i32,
    pub description: Option<String>,
    pub status: Option<String>,
    pub labels: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CardOrderItem {
    pub id: String,
    pub order_idx: i32,
    pub list_id: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ListOrderItem {
    pub id: String,
    pub order_idx: i32,
}
