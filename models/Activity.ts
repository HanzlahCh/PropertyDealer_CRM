import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IActivity extends Document {
  leadId: Types.ObjectId;
  userId: Types.ObjectId;
  action:
    | "created"
    | "status_updated"
    | "assigned"
    | "reassigned"
    | "notes_updated"
    | "follow_up_set"
    | "updated";
  details: Record<string, unknown>;
  timestamp: Date;
}

const ActivitySchema = new Schema<IActivity>({
  leadId: {
    type: Schema.Types.ObjectId,
    ref: "Lead",
    required: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action: {
    type: String,
    enum: [
      "created",
      "status_updated",
      "assigned",
      "reassigned",
      "notes_updated",
      "follow_up_set",
      "updated",
    ],
    required: true,
  },
  details: {
    type: Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Activity: Model<IActivity> =
  mongoose.models.Activity ||
  mongoose.model<IActivity>("Activity", ActivitySchema);

export default Activity;
