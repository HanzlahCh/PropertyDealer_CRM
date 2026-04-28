import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ILead extends Document {
  name: string;
  email: string;
  phone: string;
  propertyInterest: string;
  budget: number;
  status: "New" | "Contacted" | "Qualified" | "Negotiation" | "Closed-Won" | "Closed-Lost";
  notes: string;
  assignedTo: Types.ObjectId | null;
  score: number;
  priority: "High" | "Medium" | "Low";
  source: "Facebook" | "Walk-in" | "Website" | "Referral" | "Other";
  followUpDate: Date | null;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    propertyInterest: {
      type: String,
      required: [true, "Property interest is required"],
      trim: true,
    },
    budget: {
      type: Number,
      required: [true, "Budget is required"],
      min: [0, "Budget cannot be negative"],
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Negotiation", "Closed-Won", "Closed-Lost"],
      default: "New",
    },
    notes: {
      type: String,
      default: "",
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    score: {
      type: Number,
      default: 0,
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Low",
    },
    source: {
      type: String,
      enum: ["Facebook", "Walk-in", "Website", "Referral", "Other"],
      default: "Other",
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate score & priority before save
LeadSchema.pre("save", function () {
  const budget = this.budget;
  if (budget > 20_000_000) {
    this.score = 90;
    this.priority = "High";
  } else if (budget >= 10_000_000) {
    this.score = 60;
    this.priority = "Medium";
  } else {
    this.score = 30;
    this.priority = "Low";
  }
});

const Lead: Model<ILead> =
  mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema);

export default Lead;
