import { Schema, model, models, type Model, type Types } from "mongoose";

export interface ISeason {
  _id: Types.ObjectId;
  title: Types.ObjectId;
  seasonNumber: number;
  year: number;
  episodeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const seasonSchema = new Schema<ISeason>(
  {
    title: { type: Schema.Types.ObjectId, ref: "Title", required: true },
    seasonNumber: { type: Number, required: true, min: 1, max: 50 },
    year: { type: Number, required: true },
    episodeCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

seasonSchema.index({ title: 1, seasonNumber: 1 }, { unique: true });

export const Season: Model<ISeason> =
  (models.Season as Model<ISeason>) || model<ISeason>("Season", seasonSchema);
