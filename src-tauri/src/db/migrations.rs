use rusqlite::{Connection, Result};

pub fn run_migrations(conn: &Connection) -> Result<()> {
    // Enable WAL mode & foreign key constraints
    conn.execute_batch(
        "
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;
        ",
    )?;

    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS workspaces (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            image_url TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS boards (
            id TEXT PRIMARY KEY,
            workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            image_id TEXT NOT NULL,
            image_thumb_url TEXT NOT NULL,
            image_full_url TEXT NOT NULL,
            image_user_name TEXT NOT NULL,
            image_link_html TEXT NOT NULL,
            is_favorite INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS lists (
            id TEXT PRIMARY KEY,
            board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            order_idx INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS cards (
            id TEXT PRIMARY KEY,
            list_id TEXT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            order_idx INTEGER NOT NULL,
            description TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY,
            workspace_id TEXT NOT NULL,
            action TEXT NOT NULL,
            entity_id TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            entity_title TEXT NOT NULL,
            user_name TEXT NOT NULL DEFAULT 'Local User',
            user_image TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS checklists (
            id TEXT PRIMARY KEY,
            card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS checklist_items (
            id TEXT PRIMARY KEY,
            checklist_id TEXT NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            is_completed INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS labels (
            id TEXT PRIMARY KEY,
            card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            color TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS comments (
            id TEXT PRIMARY KEY,
            card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
            text TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_boards_workspace ON boards(workspace_id);
        CREATE INDEX IF NOT EXISTS idx_lists_board ON lists(board_id);
        CREATE INDEX IF NOT EXISTS idx_cards_list ON cards(list_id);
        CREATE INDEX IF NOT EXISTS idx_audit_workspace ON audit_logs(workspace_id);
        CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_id);

        CREATE TABLE IF NOT EXISTS recycle_bin (
            id TEXT PRIMARY KEY,
            item_type TEXT NOT NULL,
            item_id TEXT NOT NULL,
            title TEXT NOT NULL,
            parent_workspace_id TEXT,
            parent_board_id TEXT,
            parent_list_id TEXT,
            payload TEXT NOT NULL,
            meta TEXT NOT NULL,
            actor TEXT NOT NULL,
            deleted_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_recycle_bin_deleted_at ON recycle_bin(deleted_at DESC);
        ",
    )?;

    // Seed default workspace and board if empty
    // Add columns if they do not exist
    let _ = conn.execute("ALTER TABLE cards ADD COLUMN status TEXT NOT NULL DEFAULT 'ACTIVE'", []);
    let _ = conn.execute("ALTER TABLE cards ADD COLUMN labels TEXT NOT NULL DEFAULT '[]'", []);

    seed_default_data(conn)?;

    Ok(())
}

fn seed_default_data(conn: &Connection) -> Result<()> {
    let workspace_count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM workspaces",
        [],
        |row| row.get(0),
    )?;

    if workspace_count == 0 {
        let now = chrono::Utc::now().to_rfc3339();
        let default_ws_id = "default-workspace";
        
        conn.execute(
            "INSERT INTO workspaces (id, name, slug, image_url, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            (default_ws_id, "My Workspace", "my-workspace", "", &now, &now),
        )?;

        let default_board_id = "default-board";
        // Simple elegant gradient preset as default
        conn.execute(
            "INSERT INTO boards (id, workspace_id, title, image_id, image_thumb_url, image_full_url, image_user_name, image_link_html, is_favorite, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
            (
                default_board_id,
                default_ws_id,
                "My First Board",
                "bg-gradient-1",
                "from-blue-600 to-indigo-900",
                "from-blue-600 to-indigo-900",
                "Local User",
                "",
                0,
                &now,
                &now,
            ),
        )?;

        // Default lists
        let list_todo_id = "list-todo";
        let list_in_progress_id = "list-in-progress";
        let list_done_id = "list-done";

        conn.execute(
            "INSERT INTO lists (id, board_id, title, order_idx, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            (list_todo_id, default_board_id, "To Do", 1, &now, &now),
        )?;
        conn.execute(
            "INSERT INTO lists (id, board_id, title, order_idx, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            (list_in_progress_id, default_board_id, "In Progress", 2, &now, &now),
        )?;
        conn.execute(
            "INSERT INTO lists (id, board_id, title, order_idx, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            (list_done_id, default_board_id, "Done", 3, &now, &now),
        )?;

        // Default cards
        conn.execute(
            "INSERT INTO cards (id, list_id, title, order_idx, description, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            ("card-1", list_todo_id, "Welcome to Plynk Desktop!", 1, "This is your new local, fast, offline-first desktop Kanban workspace.", &now, &now),
        )?;
        conn.execute(
            "INSERT INTO cards (id, list_id, title, order_idx, description, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            ("card-2", list_todo_id, "Try dragging cards between lists", 2, "You can drag and drop cards to reorder or move them.", &now, &now),
        )?;
        conn.execute(
            "INSERT INTO cards (id, list_id, title, order_idx, description, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            ("card-3", list_in_progress_id, "Building offline-first apps", 1, "All data is saved instantly in local SQLite.", &now, &now),
        )?;
    }

    Ok(())
}
