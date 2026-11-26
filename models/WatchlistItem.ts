import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IWatchlistItem {
  _id: Types.ObjectId;
  profile: Types.ObjectId;
  title: Types.ObjectId;
  addedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const watchlistSchema = new Schema<IWatchlistItem>(
  {
    profile: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
    title: { type: Schema.Types.ObjectId, ref: "Title", required: true },
    addedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true },
);

watchlistSchema.index({ profile: 1, title: 1 }, { unique: true });
watchlistSchema.index({ profile: 1, addedAt: -1 });

export const WatchlistItem: Model<IWatchlistItem> =
  (models.WatchlistItem as Model<IWatchlistItem>) ||
  model<IWatchlistItem>("WatchlistItem", watchlistSchema);
