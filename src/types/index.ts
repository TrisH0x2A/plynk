export interface Workspace {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Board {
  id: string;
  workspace_id: string;
  title: string;
  image_id: string;
  image_thumb_url: string;
  image_full_url: string;
  image_user_name: string;
  image_link_html: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface List {
  id: string;
  board_id: string;
  title: string;
  order_idx: number;
  created_at: string;
  updated_at: string;
}

export type CardStatus = "ACTIVE" | "IN_PROGRESS" | "COMPLETED" | "POSTPONED";

export interface Card {
  id: string;
  list_id: string;
  title: string;
  order_idx: number;
  description?: string;
  status?: CardStatus;
  labels?: string; // JSON array string e.g. '["URGENT","BACKEND"]'
  created_at: string;
  updated_at: string;
}

export interface ListWithCards extends List {
  cards: Card[];
}

export interface AuditLog {
  id: string;
  workspace_id: string;
  action: string;
  entity_id: string;
  entity_type: 'BOARD' | 'LIST' | 'CARD';
  entity_title: string;
  user_name: string;
  user_image: string;
  created_at: string;
  updated_at: string;
}

export interface CardOrderItem {
  id: string;
  order_idx: number;
  list_id: string;
}

export interface ListOrderItem {
  id: string;
  order_idx: number;
}
