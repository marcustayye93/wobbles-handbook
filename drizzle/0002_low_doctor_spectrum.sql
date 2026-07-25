CREATE TABLE `medical_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(160) NOT NULL,
	`category` enum('vaccine-cert','vet-report','lab-result','insurance','licence','prescription','receipt','other') NOT NULL DEFAULT 'other',
	`recordDate` varchar(10) NOT NULL,
	`fileKey` varchar(256) NOT NULL,
	`url` varchar(512) NOT NULL,
	`mimeType` varchar(80),
	`sizeBytes` int,
	`note` text,
	`createdBy` int,
	`createdByName` varchar(120),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `medical_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`kind` enum('parasite','heartworm','prescription','supplement','other') NOT NULL DEFAULT 'other',
	`dose` varchar(120),
	`frequencyDays` int NOT NULL DEFAULT 30,
	`startDate` varchar(10) NOT NULL,
	`endDate` varchar(10),
	`lastGivenDate` varchar(10),
	`active` int NOT NULL DEFAULT 1,
	`note` text,
	`createdBy` int,
	`createdByName` varchar(120),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `medications_id` PRIMARY KEY(`id`)
);
