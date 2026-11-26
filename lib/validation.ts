import { z } from "zod";
import { ALL_MAX_RATINGS } from "@/lib/maturity";
import type { Maturity } from "@/lib/types";

export const avatarColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Choose a valid colour");

const maxRatingSchema = z
  .number()
  .refine((value) => ALL_MAX_RATINGS.includes(value as Maturity), "Invalid rating limit");

const profileFields = {
  name: z.string().trim().min(1, "Give this profile a name").max(24),
  avatarColor: avatarColorSchema,
  kids: z.boolean(),
  maxRating: maxRatingSchema,
};

function validateKids(data: { kids?: boolean; maxRating?: number }, ctx: z.RefinementCtx) {
  if (data.kids && typeof data.maxRating === "number" && data.maxRating > 13) {
    ctx.addIssue({
      code: "custom",
      path: ["maxRating"],
      message: "A kids profile can allow at most PG-13",
    });
  }
}

export const profileCreateSchema = z
  .object({
    name: profileFields.name,
    avatarColor: profileFields.avatarColor.default("#e8a33d"),
    kids: profileFields.kids.default(false),
    maxRating: profileFields.maxRating.default(18),
  })
  .superRefine(validateKids);

export const profileUpdateSchema = z
  .object({
    name: profileFields.name.optional(),
    avatarColor: profileFields.avatarColor.optional(),
    kids: profileFields.kids.optional(),
    maxRating: profileFields.maxRating.optional(),
  })
  .superRefine(validateKids);

export const titleCreateSchema = z.object({
  type: z.enum(["movie", "series"]),
  title: z.string().trim().min(1).max(120),
  genres: z.array(z.string().trim().min(1)).min(1).max(8),
  year: z.number().int().min(1930).max(2100),
  rating: z.number().min(0).max(10),
  maturity: maxRatingSchema,
  cast: z.array(z.string().trim().min(1)).max(20).default([]),
  description: z.string().trim().min(1).max(1200),
  thumbnailUrl: z.string().min(1).max(300),
  durationMinutes: z.number().int().min(1).max(600),
});

export const progressSchema = z.object({
  positionSeconds: z.number().int().min(0),
  durationSeconds: z.number().int().min(1).max(600 * 60),
  episodeId: z.string().regex(/^[0-9a-fA-F]{24}$/).nullable().optional(),
});

export const reactionSchema = z.object({
  value: z.enum(["like", "dislike", "clear"]),
});

export const searchSchema = z.object({
  q: z.string().trim().max(120).default(""),
  type: z.enum(["movie", "series", "all"]).default("all"),
  genre: z.string().trim().max(40).default(""),
  yearFrom: z.number().int().min(1930).max(2100).optional(),
  yearTo: z.number().int().min(1930).max(2100).optional(),
  sort: z.enum(["relevance", "rating", "newest", "trending"]).default("relevance"),
  page: z.number().int().min(1).max(10000).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});
