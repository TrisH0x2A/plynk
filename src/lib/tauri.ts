function getActiveUserName(explicitName?: string): string {
  if (explicitName && explicitName.trim()) return explicitName.trim();
  try {
    const saved = localStorage.getItem("plynk_user_name");
    if (saved && saved.trim()) return saved.trim();
  } catch {}
  return "SYS_ADMIN";
}
import { invoke } from "@tauri-apps/api/core";
import { Workspace, Board, List, Card, ListWithCards, AuditLog, ListOrderItem, CardOrderItem, RecycleBinItem } from "@/types";



export const tauriApi = {
  // Workspaces
  getWorkspaces: async (): Promise<Workspace[]> => {
    return await invoke("get_workspaces");
  },
  createWorkspace: async (name: string): Promise<Workspace> => {
    return await invoke("create_workspace", { name });
  },
  deleteWorkspace: async (id: string, userName?: string): Promise<void> => {
    return await invoke("delete_workspace", { id, userName: getActiveUserName(userName) });
  },

  // Boards
  getBoardsByWorkspace: async (workspaceId: string): Promise<Board[]> => {
    return await invoke("get_boards_by_workspace", { workspaceId });
  },
  getBoard: async (id: string): Promise<Board> => {
    return await invoke("get_board", { id });
  },
  createBoard: async (workspaceId: string, title: string, image: string): Promise<Board> => {
    const userName = getActiveUserName();
    return await invoke("create_board", { workspaceId, title, image, userName });
  },
  updateBoard: async (id: string, title: string): Promise<Board> => {
    const userName = getActiveUserName();
    return await invoke("update_board", { id, title, userName });
  },
  deleteBoard: async (id: string): Promise<void> => {
    const userName = getActiveUserName();
    return await invoke("delete_board", { id, userName });
  },

  // Lists
  getListsByBoard: async (boardId: string): Promise<ListWithCards[]> => {
    return await invoke("get_lists_by_board", { boardId });
  },
  createList: async (boardId: string, title: string): Promise<List> => {
    return await invoke("create_list", { boardId, title });
  },
  updateList: async (id: string, title: string): Promise<List> => {
    return await invoke("update_list", { id, title });
  },
  deleteList: async (id: string, userName?: string): Promise<void> => {
    return await invoke("delete_list", { id, userName: getActiveUserName(userName) });
  },
  updateListOrder: async (items: ListOrderItem[]): Promise<void> => {
    return await invoke("update_list_order", { items });
  },

  // Cards
  getCardById: async (id: string): Promise<Card> => {
    return await invoke("get_card_by_id", { id });
  },
  createCard: async (listId: string, title: string): Promise<Card> => {
    const userName = getActiveUserName();
    return await invoke("create_card", { listId, title, userName });
  },
  updateCard: async (
    id: string,
    title?: string,
    description?: string,
    status?: string,
    labels?: string
  ): Promise<Card> => {
    const userName = getActiveUserName();
    return await invoke("update_card", { id, title, description, status, labels, userName });
  },
  deleteCard: async (id: string): Promise<void> => {
    const userName = getActiveUserName();
    return await invoke("delete_card", { id, userName });
  },
  updateCardOrder: async (items: CardOrderItem[]): Promise<void> => {
    return await invoke("update_card_order", { items });
  },
  copyCard: async (id: string): Promise<Card> => {
    const userName = getActiveUserName();
    return await invoke("copy_card", { id, userName });
  },

  // Activity Logs
  getAuditLogsByWorkspace: async (workspaceId: string): Promise<AuditLog[]> => {
    return await invoke("get_audit_logs_by_workspace", { workspaceId });
  },
  getAuditLogsByEntity: async (entityId: string): Promise<AuditLog[]> => {
    return await invoke("get_audit_logs_by_entity", { entityId });
  },

  // Backup & Restore
  exportDatabase: async (targetPath: string): Promise<void> => {
    return await invoke("export_database", { targetPath });
  },

  // Recycle Bin
  getRecycleBin: async (): Promise<RecycleBinItem[]> => {
    return invoke("get_recycle_bin");
  },
  restoreBinItem: async (id: string): Promise<void> => {
    return invoke("restore_bin_item", { id });
  },
  restoreAllBinItems: async (): Promise<void> => {
    return invoke("restore_all_bin_items");
  },
  deleteBinItemPermanently: async (id: string): Promise<void> => {
    return invoke("delete_bin_item_permanently", { id });
  },
  clearRecycleBin: async (): Promise<void> => {
    return invoke("clear_recycle_bin");
  },
  openExternalUrl: async (url: string): Promise<void> => {
    try {
      await invoke("open_external_url", { url });
    } catch {
      window.open(url, "_blank");
    }
  },
  restoreDatabase: async (sourcePath: string): Promise<void> => {
    return await invoke("restore_database", { sourcePath });
  },
};
