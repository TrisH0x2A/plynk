import { AuditLog } from "@/types";

export interface LogDetails {
  actionTitle: string;
  description: string;
  badgeType: "completed" | "in_progress" | "postponed" | "labels" | "created" | "deleted" | "renamed" | "updated" | "default";
}

export const getLogDetails = (log: AuditLog): LogDetails => {
  const { action, entity_title, entity_type } = log;

  // Status Change Actions
  if (action === "STATUS_COMPLETED" || action.includes("COMPLETED")) {
    return {
      actionTitle: "TASK COMPLETED",
      description: `marked card "${entity_title}" as COMPLETED`,
      badgeType: "completed",
    };
  }
  if (action === "STATUS_IN_PROGRESS" || action.includes("IN_PROGRESS")) {
    return {
      actionTitle: "STARTED IN PROGRESS",
      description: `moved card "${entity_title}" to IN PROGRESS`,
      badgeType: "in_progress",
    };
  }
  if (action === "STATUS_POSTPONED" || action.includes("POSTPONED")) {
    return {
      actionTitle: "TASK POSTPONED",
      description: `postponed card "${entity_title}"`,
      badgeType: "postponed",
    };
  }
  if (action === "STATUS_ACTIVE") {
    return {
      actionTitle: "SET TO ACTIVE",
      description: `reset card "${entity_title}" to ACTIVE`,
      badgeType: "default",
    };
  }

  // Label Updates
  if (action.startsWith("LABELS_UPDATED")) {
    let labelInfo = "";
    try {
      const raw = action.split("LABELS_UPDATED:")[1];
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          labelInfo = ` [ ${parsed.join(", ")} ]`;
        }
      }
    } catch (e) {}

    return {
      actionTitle: "LABELS MODIFIED",
      description: `updated labels on card "${entity_title}"${labelInfo}`,
      badgeType: "labels",
    };
  }

  // Rename & Description
  if (action === "RENAMED") {
    return {
      actionTitle: "CARD RENAMED",
      description: `renamed card to "${entity_title}"`,
      badgeType: "renamed",
    };
  }
  if (action === "DESC_UPDATED") {
    return {
      actionTitle: "DESCRIPTION UPDATED",
      description: `updated description for card "${entity_title}"`,
      badgeType: "updated",
    };
  }

  // Generic Create / Delete / Update
  if (action === "CREATE") {
    return {
      actionTitle: `${entity_type} INITIALIZED`,
      description: `created ${entity_type.toLowerCase()} "${entity_title}"`,
      badgeType: "created",
    };
  }
  if (action === "DELETE") {
    return {
      actionTitle: `${entity_type} DELETED`,
      description: `deleted ${entity_type.toLowerCase()} "${entity_title}"`,
      badgeType: "deleted",
    };
  }

  return {
    actionTitle: "CARD UPDATED",
    description: `updated ${entity_type.toLowerCase()} "${entity_title}"`,
    badgeType: "default",
  };
};

export const generateLogMessage = (log: AuditLog) => {
  return getLogDetails(log).description;
};
