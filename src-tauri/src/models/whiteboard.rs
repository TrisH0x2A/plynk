use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Whiteboard {
    pub id: String,
    pub workspace_id: String,
    pub title: String,
    pub canvas_data: String,
    pub created_at: String,
    pub updated_at: String,
}
