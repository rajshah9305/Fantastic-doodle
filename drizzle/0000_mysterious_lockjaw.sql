CREATE TABLE `generatedApps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sessionId` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`prompt` text NOT NULL,
	`htmlCode` text NOT NULL,
	`cssCode` text,
	`jsCode` text,
	`generatedAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sessionId` text NOT NULL,
	`createdAt` integer NOT NULL,
	`lastActiveAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_sessionId_unique` ON `sessions` (`sessionId`);