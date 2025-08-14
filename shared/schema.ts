import { pgTable, text, serial, integer, boolean, timestamp, json, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  resetToken: varchar("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isOnboarded: boolean("is_onboarded").default(false),
});

// Messages for dynamic greetings
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  category: text("category").notNull(), // weekday_morning, friday, weekend_evening, etc.
});

// Children profiles
export const children = pgTable("children", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), // Foreign key to users table
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  avatarType: text("avatar_type").default("icon"), // icon, upload
  colour: text("colour").notNull(), // coral, yellow, teal, purple, green, blue, pink, orange
  age: integer("age"),
  completionAnimation: text("completion_animation").default("confetti"), // confetti, hearts, stars, magic, dinosaurs, princess, vehicles, party
  points: integer("points").default(0),
});

// Tasks for children
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  childId: integer("child_id").notNull(),
  title: text("title").notNull(),
  icon: text("icon").notNull(),
  weekdayMask: text("weekday_mask").notNull().default("1111111"), // 7-char string for days
  points: integer("points").default(5),
  order: integer("order").default(0),
  timeType: text("time_type", { enum: ["morning", "afternoon", "evening"] }).notNull().default("morning"),
});

// Task completions
export const taskCompletions = pgTable("task_completions", {
  id: serial("id").primaryKey(),
  childId: integer("child_id").notNull(),
  taskId: integer("task_id").notNull(),
  dateISO: text("date_iso").notNull(), // YYYY-MM-DD
  completedAt: timestamp("completed_at").defaultNow(),
});

// Points history for streaks and rewards
export const pointsHistory = pgTable("points_history", {
  id: serial("id").primaryKey(),
  childId: integer("child_id").notNull(),
  points: integer("points").notNull(),
  reason: text("reason").notNull(),
  date: text("date").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Prizes/rewards
export const prizes = pgTable("prizes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), // Foreign key to users table
  title: text("title").notNull(),
  imageUrl: text("image_url"),
  icon: text("icon").default("gift"), // lucide icon name
  color: text("color").default("purple"), // color theme
  targetPoints: integer("target_points").notNull(),
  isActive: boolean("is_active").default(true),
});

// App settings
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), // Foreign key to users table
  weatherCity: text("weather_city").default("Christchurch,NZ"),
  weatherUnits: text("weather_units").default("metric"),
  resetHour: integer("reset_hour").default(0),
  deadlineHour: integer("deadline_hour").default(8),
  ageWeightedPoints: boolean("age_weighted_points").default(false),
  pointsDeactivateHour: integer("points_deactivate_hour").default(8),
  enablePointsCutoff: boolean("enable_points_cutoff").default(false),
  morningCutoffHour: integer("morning_cutoff_hour").default(8), // Morning points cutoff hour
  morningCutoffMinute: integer("morning_cutoff_minute").default(0), // Morning points cutoff minute
  afternoonCutoffHour: integer("afternoon_cutoff_hour").default(15), // Afternoon points cutoff hour (3 PM)
  afternoonCutoffMinute: integer("afternoon_cutoff_minute").default(0), // Afternoon points cutoff minute
  eveningCutoffHour: integer("evening_cutoff_hour").default(20), // Evening points cutoff hour (8 PM)
  eveningCutoffMinute: integer("evening_cutoff_minute").default(0), // Evening points cutoff minute
  enableMorningCutoff: boolean("enable_morning_cutoff").default(false),
  enableAfternoonCutoff: boolean("enable_afternoon_cutoff").default(false),
  enableEveningCutoff: boolean("enable_evening_cutoff").default(false),
  useCustomMessage: boolean("use_custom_message").default(false),
  customMessage: text("custom_message"),
  customMorningMessage: text("custom_morning_message"),
  customAfternoonMessage: text("custom_afternoon_message"),
  customEveningMessage: text("custom_evening_message"),
  settingsPin: text("settings_pin"), // PIN to protect settings access
  enableSettingsPin: boolean("enable_settings_pin").default(false),
});

// Pet Store - Virtual pets that children can purchase and care for
export const pets = pgTable("pets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), // Foreign key to users table
  childId: integer("child_id").notNull(), // Which child owns this pet
  name: text("name").notNull(), // Custom name chosen by child
  type: text("type").notNull(), // 'puppy', 'kitten', 'fish', 'bird', 'lizard'
  happiness: integer("happiness").default(50), // 0-100 happiness level
  lastFed: timestamp("last_fed").defaultNow(),
  lastPlayed: timestamp("last_played").defaultNow(),
  totalTreats: integer("total_treats").default(0),
  totalToys: integer("total_toys").default(0),
  totalCareActions: integer("total_care_actions").default(0),
  purchasedAt: timestamp("purchased_at").defaultNow(),
});

// Pet interactions tracking
export const petInteractions = pgTable("pet_interactions", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull(),
  childId: integer("child_id").notNull(),
  action: text("action").notNull(), // 'treat', 'toy', 'care', 'visit'
  pointsCost: integer("points_cost").default(0),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true });
export const insertChildSchema = createInsertSchema(children).omit({ id: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true });
export const insertTaskCompletionSchema = createInsertSchema(taskCompletions).omit({ id: true });
export const insertPointsHistorySchema = createInsertSchema(pointsHistory).omit({ id: true });
export const insertPrizeSchema = createInsertSchema(prizes).omit({ id: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });
export const insertPetSchema = createInsertSchema(pets).omit({ id: true, purchasedAt: true });
export const insertPetInteractionSchema = createInsertSchema(petInteractions).omit({ id: true, timestamp: true });

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type Child = typeof children.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type TaskCompletion = typeof taskCompletions.$inferSelect;
export type PointsHistory = typeof pointsHistory.$inferSelect;
export type Prize = typeof prizes.$inferSelect;
export type Settings = typeof settings.$inferSelect;
export type Pet = typeof pets.$inferSelect;
export type PetInteraction = typeof petInteractions.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertChild = z.infer<typeof insertChildSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertTaskCompletion = z.infer<typeof insertTaskCompletionSchema>;
export type InsertPointsHistory = z.infer<typeof insertPointsHistorySchema>;
export type InsertPrize = z.infer<typeof insertPrizeSchema>;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type InsertPet = z.infer<typeof insertPetSchema>;
export type InsertPetInteraction = z.infer<typeof insertPetInteractionSchema>;
