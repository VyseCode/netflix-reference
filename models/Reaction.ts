import { Schema, model, models, type Model, type Types } from "mongoose";

export type ReactionValue = "like" | "dislike";

export interface IReaction {
  _id: Types.ObjectId;
  profile: Types.ObjectId;
  title: Types.ObjectId;
  value: ReactionValue;
  createdAt: Date;
  updatedAt: Date;
}

const reactionSchema = new Schema<IReaction>(
  {
    profile: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
    title: { type: Schema.Types.ObjectId, ref: "Title", required: true },
    value: { type: String, enum: ["like", "dislike"], required: true },
  },
  { timestamps: true },
);

reactionSchema.index({ profile: 1, title: 1 }, { unique: true });
reactionSchema.index({ profile: 1, value: 1 });

export const Reaction: Model<IReaction> =
  (models.Reaction as Model<IReaction>) ||
  model<IReaction>("Reaction", reactionSchema);
