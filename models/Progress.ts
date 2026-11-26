import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IProgress {
  _id: Types.ObjectId;
  profile: Types.ObjectId;
  title: Types.ObjectId;
  episode: Types.ObjectId | null;
  positionSeconds: number;
  durationSeconds: number;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const progressSchema = new Schema<IProgress>(
  {
    profile: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
    title: { type: Schema.Types.ObjectId, ref: "Title", required: true },
    episode: { type: Schema.Types.ObjectId, ref: "Episode", default: null },
    positionSeconds: { type: Number, default: 0, min: 0 },
    durationSeconds: { type: Number, required: true, min: 1 },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

progressSchema.index({ profile: 1, title: 1 }, { unique: true });
progressSchema.index({ profile: 1, updatedAt: -1 });

export const Progress: Model<IProgress> =
  (models.Progress as Model<IProgress>) ||
  model<IProgress>("Progress", progressSchema);
