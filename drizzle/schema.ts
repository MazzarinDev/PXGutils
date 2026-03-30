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
 * Users table - Identificação por nome de personagem (ex: Kooxh)
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  /** Nome do personagem - Identificador único (ex: Kooxh) */
  characterName: varchar("characterName", { length: 64 }).notNull().unique(),
  /** Nível do personagem */
  level: int("level").default(1).notNull(),
  /** Classe/Profissão do personagem */
  class: varchar("class", { length: 64 }),
  /** Experiência acumulada */
  experience: int("experience").default(0).notNull(),
  /** Bio/Descrição do personagem */
  bio: text("bio"),
  /** URL do avatar */
  avatar: varchar("avatar", { length: 500 }),
  /** Guilda principal */
  mainGuildId: int("mainGuildId"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  characterNameIdx: index("idx_character_name").on(table.characterName),
  mainGuildIdIdx: index("idx_main_guild_id").on(table.mainGuildId),
  createdAtIdx: index("idx_created_at").on(table.createdAt),
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
  leaderId: int("leaderId").notNull(),
  inviteCode: varchar("inviteCode", { length: 32 }).unique(),
  maxMembers: int("maxMembers").default(50),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  leaderIdIdx: index("idx_leader_id").on(table.leaderId),
  inviteCodeIdx: index("idx_invite_code").on(table.inviteCode),
}));

export type Guild = typeof guilds.$inferSelect;
export type InsertGuild = typeof guilds.$inferInsert;

/**
 * Guild members with roles
 */
export const guildMembers = mysqlTable("guildMembers", {
  id: int("id").autoincrement().primaryKey(),
  guildId: int("guildId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["leader", "officer", "member"]).default("member").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
}, (table) => ({
  guildIdIdx: index("idx_guild_id").on(table.guildId),
  userIdIdx: index("idx_user_id").on(table.userId),
  uniqueMember: index("idx_guild_user").on(table.guildId, table.userId),
}));

export type GuildMember = typeof guildMembers.$inferSelect;
export type InsertGuildMember = typeof guildMembers.$inferInsert;

/**
 * Task categories (Quest, Catch, Profession, Daily, Custom)
 */
export const taskCategories = mysqlTable("taskCategories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }).default("#6366f1"),
  icon: varchar("icon", { length: 64 }),
}, (table) => ({
  nameIdx: index("idx_category_name").on(table.name),
}));

export type TaskCategory = typeof taskCategories.$inferSelect;
export type InsertTaskCategory = typeof taskCategories.$inferInsert;

/**
 * Tasks/Quests
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  guildId: int("guildId").notNull(),
  categoryId: int("categoryId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  status: mysqlEnum("status", ["todo", "in_progress", "completed", "archived"]).default("todo").notNull(),
  assignedTo: int("assignedTo"),
  dueDate: datetime("dueDate"),
  dueTime: varchar("dueTime", { length: 5 }), // HH:MM format
  completedAt: datetime("completedAt"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  guildIdIdx: index("idx_task_guild_id").on(table.guildId),
  categoryIdIdx: index("idx_task_category_id").on(table.categoryId),
  assignedToIdx: index("idx_assigned_to").on(table.assignedTo),
  statusIdx: index("idx_task_status").on(table.status),
  dueDateIdx: index("idx_due_date").on(table.dueDate),
}));

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * Task tags for organization
 */
export const tags = mysqlTable("tags", {
  id: int("id").autoincrement().primaryKey(),
  guildId: int("guildId").notNull(),
  name: varchar("name", { length: 64 }).notNull(),
  color: varchar("color", { length: 7 }).default("#8b5cf6"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  guildIdIdx: index("idx_tag_guild_id").on(table.guildId),
  nameIdx: index("idx_tag_name").on(table.name),
}));

export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;

/**
 * Task-Tag relationship
 */
export const taskTags = mysqlTable("taskTags", {
  taskId: int("taskId").notNull(),
  tagId: int("tagId").notNull(),
}, (table) => ({
  taskIdIdx: index("idx_task_tags_task_id").on(table.taskId),
  tagIdIdx: index("idx_task_tags_tag_id").on(table.tagId),
}));

export type TaskTag = typeof taskTags.$inferSelect;

/**
 * Alarms for timed events (Boss Respawn, Invasion, Cooldown, etc)
 */
export const alarms = mysqlTable("alarms", {
  id: int("id").autoincrement().primaryKey(),
  guildId: int("guildId").notNull(),
  taskId: int("taskId"),
  type: mysqlEnum("type", ["boss_respawn", "invasion", "cooldown", "event", "custom"]).default("custom").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  triggerTime: datetime("triggerTime").notNull(),
  notifyBefore: int("notifyBefore").default(300), // seconds before
  isRecurring: boolean("isRecurring").default(false),
  recurringPattern: varchar("recurringPattern", { length: 64 }), // cron-like
  isActive: boolean("isActive").default(true),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  guildIdIdx: index("idx_alarm_guild_id").on(table.guildId),
  taskIdIdx: index("idx_alarm_task_id").on(table.taskId),
  triggerTimeIdx: index("idx_trigger_time").on(table.triggerTime),
  isActiveIdx: index("idx_alarm_is_active").on(table.isActive),
}));

export type Alarm = typeof alarms.$inferSelect;
export type InsertAlarm = typeof alarms.$inferInsert;

/**
 * Notifications sent to users
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  alarmId: int("alarmId"),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  type: mysqlEnum("type", ["alarm", "task_assigned", "task_completed", "guild_invite", "system"]).default("system").notNull(),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("idx_notification_user_id").on(table.userId),
  alarmIdIdx: index("idx_notification_alarm_id").on(table.alarmId),
  isReadIdx: index("idx_is_read").on(table.isRead),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Task history for audit trail
 */
export const taskHistory = mysqlTable("taskHistory", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull(),
  action: mysqlEnum("action", ["created", "updated", "status_changed", "assigned", "completed", "deleted"]).notNull(),
  changedBy: int("changedBy").notNull(),
  oldValues: json("oldValues"),
  newValues: json("newValues"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  taskIdIdx: index("idx_history_task_id").on(table.taskId),
  changedByIdx: index("idx_changed_by").on(table.changedBy),
}));

export type TaskHistory = typeof taskHistory.$inferSelect;
export type InsertTaskHistory = typeof taskHistory.$inferInsert;

/**
 * Guild statistics
 */
export const guildStats = mysqlTable("guildStats", {
  id: int("id").autoincrement().primaryKey(),
  guildId: int("guildId").notNull().unique(),
  totalTasks: int("totalTasks").default(0),
  completedTasks: int("completedTasks").default(0),
  activeTasks: int("activeTasks").default(0),
  totalMembers: int("totalMembers").default(0),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  guildIdIdx: index("idx_stats_guild_id").on(table.guildId),
}));

export type GuildStats = typeof guildStats.$inferSelect;
export type InsertGuildStats = typeof guildStats.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  guilds: many(guilds),
  guildMembers: many(guildMembers),
  tasks: many(tasks),
  alarms: many(alarms),
  notifications: many(notifications),
  taskHistory: many(taskHistory),
}));

export const guildsRelations = relations(guilds, ({ many, one }) => ({
  leader: one(users, {
    fields: [guilds.leaderId],
    references: [users.id],
  }),
  members: many(guildMembers),
  tasks: many(tasks),
  tags: many(tags),
  alarms: many(alarms),
  stats: one(guildStats),
}));

export const guildMembersRelations = relations(guildMembers, ({ one }) => ({
  guild: one(guilds, {
    fields: [guildMembers.guildId],
    references: [guilds.id],
  }),
  user: one(users, {
    fields: [guildMembers.userId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  guild: one(guilds, {
    fields: [tasks.guildId],
    references: [guilds.id],
  }),
  category: one(taskCategories, {
    fields: [tasks.categoryId],
    references: [taskCategories.id],
  }),
  assignee: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
  }),
  tags: many(taskTags),
  history: many(taskHistory),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  guild: one(guilds, {
    fields: [tags.guildId],
    references: [guilds.id],
  }),
  tasks: many(taskTags),
}));

export const alarmsRelations = relations(alarms, ({ one, many }) => ({
  guild: one(guilds, {
    fields: [alarms.guildId],
    references: [guilds.id],
  }),
  task: one(tasks, {
    fields: [alarms.taskId],
    references: [tasks.id],
  }),
  creator: one(users, {
    fields: [alarms.createdBy],
    references: [users.id],
  }),
  notifications: many(notifications),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  alarm: one(alarms, {
    fields: [notifications.alarmId],
    references: [alarms.id],
  }),
}));

export const taskHistoryRelations = relations(taskHistory, ({ one }) => ({
  task: one(tasks, {
    fields: [taskHistory.taskId],
    references: [tasks.id],
  }),
  changedByUser: one(users, {
    fields: [taskHistory.changedBy],
    references: [users.id],
  }),
}));
