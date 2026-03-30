CREATE TABLE `alarms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`guildId` int NOT NULL,
	`createdById` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text,
	`alarmType` enum('boss_respawn','invasion','cooldown','event','custom') NOT NULL DEFAULT 'custom',
	`triggerDateTime` datetime NOT NULL,
	`notifyBefore` int DEFAULT 300,
	`isActive` boolean DEFAULT true,
	`isRecurring` boolean DEFAULT false,
	`recurringPattern` varchar(64),
	`notifyMembers` boolean DEFAULT true,
	`notificationsSent` int DEFAULT 0,
	`metadata` json DEFAULT ('{}'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alarms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `guildMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`guildId` int NOT NULL,
	`userId` int NOT NULL,
	`memberRole` enum('leader','officer','member') NOT NULL DEFAULT 'member',
	`canEditTasks` boolean DEFAULT false,
	`canDeleteTasks` boolean DEFAULT false,
	`canManageMembers` boolean DEFAULT false,
	`canCreateAlarms` boolean DEFAULT false,
	`tasksCompleted` int DEFAULT 0,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `guildMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `guildStats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`guildId` int NOT NULL,
	`totalTasks` int DEFAULT 0,
	`completedTasks` int DEFAULT 0,
	`inProgressTasks` int DEFAULT 0,
	`activeMembers` int DEFAULT 0,
	`totalMembers` int DEFAULT 0,
	`tasksCompletedThisWeek` int DEFAULT 0,
	`tasksCompletedThisMonth` int DEFAULT 0,
	`metadata` json DEFAULT ('{}'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `guildStats_id` PRIMARY KEY(`id`),
	CONSTRAINT `guildStats_guildId_unique` UNIQUE(`guildId`)
);
--> statement-breakpoint
CREATE TABLE `guilds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text,
	`ownerId` int NOT NULL,
	`maxMembers` int DEFAULT 50,
	`isPublic` boolean DEFAULT true,
	`joinCode` varchar(32),
	`totalTasksCompleted` int DEFAULT 0,
	`totalMembers` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `guilds_id` PRIMARY KEY(`id`),
	CONSTRAINT `guilds_joinCode_unique` UNIQUE(`joinCode`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`guildId` int,
	`title` varchar(256) NOT NULL,
	`message` text,
	`notificationType` enum('task_assigned','task_completed','alarm_triggered','member_joined','custom') NOT NULL DEFAULT 'custom',
	`isRead` boolean DEFAULT false,
	`readAt` timestamp,
	`relatedTaskId` int,
	`relatedAlarmId` int,
	`metadata` json DEFAULT ('{}'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`guildId` int NOT NULL,
	`name` varchar(64) NOT NULL,
	`color` varchar(7) DEFAULT '#6366f1',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `taskCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`guildId` int NOT NULL,
	`name` varchar(64) NOT NULL,
	`displayName` varchar(128) NOT NULL,
	`description` text,
	`color` varchar(7) DEFAULT '#6366f1',
	`icon` varchar(32) DEFAULT 'list',
	`position` int DEFAULT 0,
	`isDefault` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `taskCategories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `taskHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` int NOT NULL,
	`guildId` int NOT NULL,
	`action` enum('created','updated','completed','archived','reassigned') NOT NULL,
	`changedById` int NOT NULL,
	`previousStatus` enum('todo','in_progress','completed','archived'),
	`newStatus` enum('todo','in_progress','completed','archived'),
	`notes` text,
	`metadata` json DEFAULT ('{}'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `taskHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`guildId` int NOT NULL,
	`categoryId` int NOT NULL,
	`createdById` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text,
	`taskType` enum('quest','catch','profession','daily','custom') NOT NULL DEFAULT 'custom',
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`status` enum('todo','in_progress','completed','archived') NOT NULL DEFAULT 'todo',
	`dueDate` datetime,
	`dueTime` varchar(5),
	`estimatedHours` decimal(5,2),
	`assignedToId` int,
	`completedAt` timestamp,
	`completedById` int,
	`tags` json DEFAULT ('[]'),
	`metadata` json DEFAULT ('{}'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `mainGuildId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `profileBio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `profileLevel` int DEFAULT 1;--> statement-breakpoint
ALTER TABLE `users` ADD `profileExperience` int DEFAULT 0;--> statement-breakpoint
CREATE INDEX `guildId_idx` ON `alarms` (`guildId`);--> statement-breakpoint
CREATE INDEX `createdById_idx` ON `alarms` (`createdById`);--> statement-breakpoint
CREATE INDEX `triggerDateTime_idx` ON `alarms` (`triggerDateTime`);--> statement-breakpoint
CREATE INDEX `guildId_idx` ON `guildMembers` (`guildId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `guildMembers` (`userId`);--> statement-breakpoint
CREATE INDEX `guildId_idx` ON `guildStats` (`guildId`);--> statement-breakpoint
CREATE INDEX `ownerId_idx` ON `guilds` (`ownerId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `guildId_idx` ON `notifications` (`guildId`);--> statement-breakpoint
CREATE INDEX `isRead_idx` ON `notifications` (`isRead`);--> statement-breakpoint
CREATE INDEX `guildId_idx` ON `tags` (`guildId`);--> statement-breakpoint
CREATE INDEX `guildId_idx` ON `taskCategories` (`guildId`);--> statement-breakpoint
CREATE INDEX `taskId_idx` ON `taskHistory` (`taskId`);--> statement-breakpoint
CREATE INDEX `guildId_idx` ON `taskHistory` (`guildId`);--> statement-breakpoint
CREATE INDEX `changedById_idx` ON `taskHistory` (`changedById`);--> statement-breakpoint
CREATE INDEX `guildId_idx` ON `tasks` (`guildId`);--> statement-breakpoint
CREATE INDEX `categoryId_idx` ON `tasks` (`categoryId`);--> statement-breakpoint
CREATE INDEX `createdById_idx` ON `tasks` (`createdById`);--> statement-breakpoint
CREATE INDEX `assignedToId_idx` ON `tasks` (`assignedToId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `tasks` (`status`);--> statement-breakpoint
CREATE INDEX `mainGuildId_idx` ON `users` (`mainGuildId`);