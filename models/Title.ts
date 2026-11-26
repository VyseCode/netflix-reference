import { Schema, model, models, type Model, type Types } from "mongoose";

export const MATURITY_LEVELS = [0, 7, 13, 16, 18] as const;
export type Maturity = (typeof MATURITY_LEVELS)[number];
export type TitleType = "movie" | "series";

export interface ITitle {
  _id: Types.ObjectId;
  type: TitleType;
  title: string;
  genres: string[];
  year: number;
  rating: number;
  maturity: Maturity;
  cast: string[];
  description: string;
  thumbnailUrl: string;
  durationMinutes: number;
  trendingScore: number;
  addedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const titleSchema = new Schema<ITitle>(
  {
    type: { type: String, enum: ["movie", "series"], required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    genres: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) => value.length >= 1 && value.length <= 8,
        message: "A title needs between 1 and 8 genres",
      },
    },
    year: { type: Number, required: true, min: 1930, max: 2100 },
    rating: { type: Number, required: true, min: 0, max: 10 },
    maturity: { type: Number, enum: MATURITY_LEVELS, required: true },
    cast: {
      type: [String],
      default: [],
      validate: {
        validator: (value: string[]) => value.length <= 20,
        message: "Cast list is capped at 20 names",
      },
    },
    description: { type: String, required: true, maxlength: 1200 },
    thumbnailUrl: { type: String, required: true },
    durationMinutes: { type: Number, required: true, min: 1, max: 600 },
    trendingScore: { type: Number, default: 0 },
    addedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true },
);

titleSchema.index({ type: 1, addedAt: -1 });
titleSchema.index({ trendingScore: -1 });
titleSchema.index({ rating: -1 });
titleSchema.index({ genres: 1, rating: -1 });
titleSchema.index({ year: -1 });
titleSchema.index({ maturity: 1, rating: -1 });
titleSchema.index(
  { title: "text", genres: "text", cast: "text", description: "text" },
  { weights: { title: 6, genres: 3, cast: 2, description: 1 }, name: "title_text" },
);

export const Title: Model<ITitle> =
  (models.Title as Model<ITitle>) || model<ITitle>("Title", titleSchema);
