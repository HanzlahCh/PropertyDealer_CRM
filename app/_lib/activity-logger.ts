import dbConnect from "@/app/_lib/db";
import Activity from "@/models/Activity";

type ActionType =
  | "created"
  | "status_updated"
  | "assigned"
  | "reassigned"
  | "notes_updated"
  | "follow_up_set"
  | "updated";

interface LogActivityInput {
  leadId: string;
  userId: string;
  action: ActionType;
  details?: Record<string, unknown>;
}

export async function logActivity({
  leadId,
  userId,
  action,
  details = {},
}: LogActivityInput): Promise<void> {
  try {
    await dbConnect();
    await Activity.create({
      leadId,
      userId,
      action,
      details,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("[ActivityLogger] Failed to log activity:", error);
  }
}
