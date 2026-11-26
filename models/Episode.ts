import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IEpisode {
  _id: Types.ObjectId;
  season: Types.ObjectId;
  title: Types.ObjectId;
  episodeNumber: number;
  name: string;
  description: string;
  durationMinutes: number;
  thumbnailUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const episodeSchema = new Schema<IEpisode>(
  {
    season: { type: Schema.Types.ObjectId, ref: "Season", required: true },
    title: { type: Schema.Types.ObjectId, ref: "Title", required: true },
    episodeNumber: { type: Number, required: true, min: 1, max: 100 },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, maxlength: 800 },
    durationMinutes: { type: Number, required: true, min: 1, max: 300 },
    thumbnailUrl: { type: String, required: true },
  },
  { timestamps: true },
);

episodeSchema.index({ season: 1, episodeNumber: 1 }, { unique: true });
episodeSchema.index({ title: 1 });

export const Episode: Model<IEpisode> =
  (models.Episode as Model<IEpisode>) ||
  model<IEpisode>("Episode", episodeSchema);
