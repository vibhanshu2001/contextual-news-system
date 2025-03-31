CREATE DATABASE IF NOT EXISTS news_db;
USE news_db;
CREATE TABLE `news` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `url` text NOT NULL,
  `publication_date` datetime NOT NULL,
  `source_name` varchar(255) NOT NULL,
  `category` json NOT NULL,
  `relevance_score` float NOT NULL,
  `latitude` float DEFAULT NULL,
  `longitude` float DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;