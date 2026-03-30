import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  datetime,
  json,
  index,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extended with guild and profile information.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // Guild profile
  mainGuildId: int("mainGuildId"),
  profileBio: text("profileBio"),
  profileLevel: int("profileLevel").default(1),
  profileExperience: int("profileExperience").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  mainGuildIdIdx: index("mainGuildId_idx").on(table.mainGuildId),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Guilds table for collaborative task management
 */
export const guilds = mysqlTable("guilds", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  ownerId: int("ownerId").notNull(),
  
  // Guild settings
  maxMembers: int("maxMembers").default(50),
  isPublic: boolean("isPublic").default(true),
  joinCode: varchar("joinCode", { length: 32 }).unique(),
  
  // Guild stats
  totalTasksCompleted: int("totalTasksCompleted").default(0),
  totalMembers: int("totalMembers").default(1),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  ownerIdIdx: index("ownerId_idx").on(table.ownerId),
}));

export type Guild = typeof guilds.$inferSelect;
export type InsertGuild = typeof guilds.$inferInsert;

/**
 * Guild members with roles and permissions
 */
export const guildMembers = mysqlTable("guildMembers", {
  id: int("id").autoincrement().primaryKey(),
  guildId: int("guildId").notNull(),
  userId: int("userId").notNull(),
  
  // Member role and permissions
  memberRole: mysqlEnum("memberRole", ["leader", "officer", "member"]).default("member").notNull(),
  canEditTasks: boolean("canEditTasks").default(false),
  canDeleteTasks: boolean("canDeleteTasks").default(false),
  canManageMembers: boolean("canManageMembers").default(false),
  canCreateAlarms: boolean("canCreateAlarms").default(false),
  
  // Member stats
  tasksCompleted: int("tasksCompleted").default(0),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  guildIdIdx: index("guildId_idx").on(table.guildId),
  userIdIdx: index("userId_idx").on(table.userId),
}));

export type GuildMember = typeof guildMembers.$inferSelect;
export type InsertGuildMember = typeof guildMembers.$inferInsert;

/**
 * Task categories/columns for Kanban board
 */
export const taskCategories = mysqlTable("taskCategories", {
  id: int("id").autoincrement().primaryKey(),
  guildId: int("guildId").notNull(),
  name: varchar("name", { length: 64 }).notNull(),
  displayName: varchar("displayName", { length: 128 }).notNull(),
  description: text("description"),
  
  // Kanban column settings
  color: varchar("color", { length: 7 }).default("#6366f1"), // hex color
  icon: varchar("icon", { length: 32 }).default("list"), // lucide icon name
  position: int("position").default(0),
  isDefault: boolean("isDefault").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  guildIdIdx: index("guildId_idx").on(table.guildId),
}));

export type TaskCategory = typeof taskCategories.$inferSelect;
export type InsertTaskCategory = typeof taskCategories.$inferInsert;

/**
 * Tasks/Quests for Kanban board
 * Supports Quests, Catch, Profissões, Tasks Diárias (Brotherhood/Danger Room)
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  guildId: int("guildId").notNull(),
  categoryId: int("categoryId").notNull(),
  createdById: int("createdById").notNull(),
  
  // Task info
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  taskType: mysqlEnum("taskType", ["quest", "catch", "profession", "daily", "custom"]).default("custom").notNull(),
  
  // Priority and status
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  status: mysqlEnum("status", ["todo", "in_progress", "completed", "archived"]).default("todo").notNull(),
  
  // Timing
  dueDate: datetime("dueDate"),
  dueTime: varchar("dueTime", { length: 5 }), // HH:MM format
  estimatedHours: decimal("estimatedHours", { precision: 5, scale: 2 }),
  
  // Assignment
  assignedToId: int("assignedToId"),
  
  // Completion tracking
  completedAt: timestamp("completedAt"),
  completedById: int("completedById"),
  
  // Tags and metadata
  tags: json("tags").$type<string[]>().default([]),
  metadata: json("metadata").$type<Record<string, unknown>>().default({}),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  guildIdIdx: index("guildId_idx").on(table.guildId),
  categoryIdIdx: index("categoryId_idx").on(table.categoryId),
  createdByIdIdx: index("createdById_idx").on(table.createdById),
  assignedToIdIdx: index("assignedToId_idx").on(table.assignedToId),
  statusIdx: index("status_idx").on(table.status),
}));

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * Task history for tracking changes and completion statistics
 */
export const taskHistory = mysqlTable("taskHistory", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull(),
  guildId: int("guildId").notNull(),
  
  // History tracking
  action: mysqlEnum("action", ["created", "updated", "completed", "archived", "reassigned"]).notNull(),
  changedById: int("changedById").notNull(),
  
  // Changes
  previousStatus: mysqlEnum("previousStatus", ["todo", "in_progress", "completed", "archived"]),
  newStatus: mysqlEnum("newStatus", ["todo", "in_progress", "completed", "archived"]),
  
  // Metadata
  notes: text("notes"),
  metadata: json("metadata").$type<Record<string, unknown>>().default({}),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  taskIdIdx: index("taskId_idx").on(table.taskId),
  guildIdIdx: index("guildId_idx").on(table.guildId),
  changedByIdIdx: index("changedById_idx").on(table.changedById),
}));

export type TaskHistory = typeof taskHistory.$inferSelect;
export type InsertTaskHistory = typeof taskHistory.$inferInsert;

/**
 * Alarms for game events (boss respawn, invasions, cooldowns)
 */
export const alarms = mysqlTable("alarms", {
  id: int("id").autoincrement().primaryKey(),
  guildId: int("guildId").notNull(),
  createdById: int("createdById").notNull(),
  
  // Alarm info
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  alarmType: mysqlEnum("alarmType", ["boss_respawn", "invasion", "cooldown", "event", "custom"]).default("custom").notNull(),
  
  // Timing
  triggerDateTime: datetime("triggerDateTime").notNull(),
  notifyBefore: int("notifyBefore").default(300), // seconds before event
  
  // Status
  isActive: boolean("isActive").default(true),
  isRecurring: boolean("isRecurring").default(false),
  recurringPattern: varchar("recurringPattern", { length: 64 }), // cron-like pattern
  
  // Notification
  notifyMembers: boolean("notifyMembers").default(true),
  notificationsSent: int("notificationsSent").default(0),
  
  // Metadata
  metadata: json("metadata").$type<Record<string, unknown>>().default({}),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  guildIdIdx: index("guildId_idx").on(table.guildId),
  createdByIdIdx: index("createdById_idx").on(table.createdById),
  triggerDateTimeIdx: index("triggerDateTime_idx").on(table.triggerDateTime),
}));

export type Alarm = typeof alarms.$inferSelect;
export type InsertAlarm = typeof alarms.$inferInsert;

/**
 * Notifications sent to users
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  guildId: int("guildId"),
  
  // Notification content
  title: varchar("title", { length: 256 }).notNull(),
  message: text("message"),
  notificationType: mysqlEnum("notificationType", ["task_assigned", "task_completed", "alarm_triggered", "member_joined", "custom"]).default("custom").notNull(),
  
  // Status
  isRead: boolean("isRead").default(false),
  readAt: timestamp("readAt"),
  
  // Metadata
  relatedTaskId: int("relatedTaskId"),
  relatedAlarmId: int("relatedAlarmId"),
  metadata: json("metadata").$type<Record<string, unknown>>().default({}),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  guildIdIdx: index("guildId_idx").on(table.guildId),
  isReadIdx: index("isRead_idx").on(table.isRead),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Tags for task organization
 */
export const tags = mysqlTable("tags", {
  id: int("id").autoincrement().primaryKey(),
  guildId: int("guildId").notNull(),
  name: varchar("name", { length: 64 }).notNull(),
  color: varchar("color", { length: 7 }).default("#6366f1"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  guildIdIdx: index("guildId_idx").on(table.guildId),
}));

export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;

/**
 * Guild statistics and metrics
 */
export const guildStats = mysqlTable("guildStats", {
  id: int("id").autoincrement().primaryKey(),
  guildId: int("guildId").notNull().unique(),
  
  // Statistics
  totalTasks: int("totalTasks").default(0),
  completedTasks: int("completedTasks").default(0),
  inProgressTasks: int("inProgressTasks").default(0),
  
  // Member stats
  activeMembers: int("activeMembers").default(0),
  totalMembers: int("totalMembers").default(0),
  
  // Engagement
  tasksCompletedThisWeek: int("tasksCompletedThisWeek").default(0),
  tasksCompletedThisMonth: int("tasksCompletedThisMonth").default(0),
  
  // Metadata
  metadata: json("metadata").$type<Record<string, unknown>>().default({}),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  guildIdIdx: index("guildId_idx").on(table.guildId),
}));

export type GuildStats = typeof guildStats.$inferSelect;
export type InsertGuildStats = typeof guildStats.$inferInsert;

/**
 * Relations for Drizzle ORM
 */
export const usersRelations = relations(users, ({ many, one }) => ({
  guilds: many(guilds),
  guildMembers: many(guildMembers),
  createdTasks: many(tasks, { relationName: "createdBy" }),
  assignedTasks: many(tasks, { relationName: "assignedTo" }),
  createdAlarms: many(alarms),
  notifications: many(notifications),
  taskHistory: many(taskHistory),
}));

export const guildsRelations = relations(guilds, ({ many, one }) => ({
  owner: one(users, { fields: [guilds.ownerId], references: [users.id] }),
  members: many(guildMembers),
  tasks: many(tasks),
  categories: many(taskCategories),
  alarms: many(alarms),
  tags: many(tags),
  stats: one(guildStats),
  notifications: many(notifications),
}));

export const guildMembersRelations = relations(guildMembers, ({ one }) => ({
  guild: one(guilds, { fields: [guildMembers.guildId], references: [guilds.id] }),
  user: one(users, { fields: [guildMembers.userId], references: [users.id] }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  guild: one(guilds, { fields: [tasks.guildId], references: [guilds.id] }),
  category: one(taskCategories, { fields: [tasks.categoryId], references: [taskCategories.id] }),
  createdBy: one(users, { fields: [tasks.createdById], references: [users.id], relationName: "createdBy" }),
  assignedTo: one(users, { fields: [tasks.assignedToId], references: [users.id], relationName: "assignedTo" }),
  completedBy: one(users, { fields: [tasks.completedById], references: [users.id] }),
  history: many(taskHistory),
}));

export const taskCategoriesRelations = relations(taskCategories, ({ one, many }) => ({
  guild: one(guilds, { fields: [taskCategories.guildId], references: [guilds.id] }),
  tasks: many(tasks),
}));

export const alarmsRelations = relations(alarms, ({ one, many }) => ({
  guild: one(guilds, { fields: [alarms.guildId], references: [guilds.id] }),
  createdBy: one(users, { fields: [alarms.createdById], references: [users.id] }),
  notifications: many(notifications),
}));

export const tagsRelations = relations(tags, ({ one }) => ({
  guild: one(guilds, { fields: [tags.guildId], references: [guilds.id] }),
}));

export const guildStatsRelations = relations(guildStats, ({ one }) => ({
  guild: one(guilds, { fields: [guildStats.guildId], references: [guilds.id] }),
}));
