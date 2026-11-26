import { Schema, model, models, type Model, type Types } from "mongoose";

export const MAX_RATINGS = [0, 7, 13, 16, 18] as const;
export type MaxRating = (typeof MAX_RATINGS)[number];

export interface IProfile {
  _id: Types.ObjectId;
  account: Types.ObjectId;
  name: string;
  avatarColor: string;
  kids: boolean;
  maxRating: MaxRating;
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<IProfile>(
  {
    account: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 24 },
    avatarColor: { type: String, default: "#e8a33d" },
    kids: { type: Boolean, default: false },
    maxRating: {
      type: Number,
      enum: MAX_RATINGS,
      default: 18,
    },
  },
  { timestamps: true },
);

profileSchema.index({ account: 1, name: 1 }, { unique: true });
profileSchema.index({ account: 1, createdAt: 1 });

export const Profile: Model<IProfile> =
  (models.Profile as Model<IProfile>) ||
  model<IProfile>("Profile", profileSchema);
