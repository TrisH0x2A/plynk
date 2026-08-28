use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AuditLog {
    pub id: String,
    pub workspace_id: String,
    pub action: String,
    pub entity_id: String,
    pub entity_type: String,
    pub entity_title: String,
    pub user_name: String,
    pub user_image: String,
    pub created_at: String,
    pub updated_at: String,
}
