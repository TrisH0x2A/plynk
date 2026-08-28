use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Workspace {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub image_url: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}
