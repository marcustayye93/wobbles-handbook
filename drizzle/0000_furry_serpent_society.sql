CREATE TABLE `photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fileKey` varchar(256) NOT NULL,
	`url` varchar(512) NOT NULL,
	`caption` text,
	`date` varchar(10) NOT NULL,
	`createdBy` int,
	`createdByName` varchar(120),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shared_state` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stateKey` varchar(128) NOT NULL,
	`value` json NOT NULL,
	`updatedBy` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shared_state_id` PRIMARY KEY(`id`),
	CONSTRAINT `shared_state_stateKey_unique` UNIQUE(`stateKey`)
);
--> statement-breakpoint
CREATE TABLE `tracker_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trackerId` varchar(32) NOT NULL,
	`date` varchar(10) NOT NULL,
	`time` varchar(5),
	`option` varchar(64),
	`value` varchar(32),
	`note` text,
	`createdBy` int,
	`createdByName` varchar(120),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tracker_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
