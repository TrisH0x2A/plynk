use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Board {
    pub id: String,
    pub workspace_id: String,
    pub title: String,
    pub image_id: String,
    pub image_thumb_url: String,
    pub image_full_url: String,
    pub image_user_name: String,
    pub image_link_html: String,
    pub is_favorite: bool,
    pub created_at: String,
    pub updated_at: String,
}
