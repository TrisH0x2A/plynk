use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RecycleBinItem {
    pub id: String,
    pub item_type: String,
    pub item_id: String,
    pub title: String,
    pub parent_workspace_id: Option<String>,
    pub parent_board_id: Option<String>,
    pub parent_list_id: Option<String>,
    pub payload: String,
    pub meta: String,
    pub actor: String,
    pub deleted_at: String,
}
