-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.46 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.20.0.7320
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for frms_db
CREATE DATABASE IF NOT EXISTS `frms_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `frms_db`;

-- Dumping structure for table frms_db.alerts
CREATE TABLE IF NOT EXISTS `alerts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ingredient_id` int unsigned NOT NULL,
  `alert_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'LOW_STOCK',
  `threshold` decimal(10,2) NOT NULL,
  `triggered_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_alerts_ingredient_unresolved` (`ingredient_id`,`resolved_at`),
  CONSTRAINT `fk_alerts_ingredient` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table frms_db.alerts: ~3 rows (approximately)
INSERT INTO `alerts` (`id`, `ingredient_id`, `alert_type`, `threshold`, `triggered_at`, `resolved_at`) VALUES
	(1, 7, 'LOW_STOCK', 3.00, '2026-08-14 16:46:15', NULL),
	(2, 6, 'LOW_STOCK', 3.00, '2026-08-14 16:47:40', NULL),
	(3, 8, 'LOW_STOCK', 1.00, '2026-08-16 06:09:16', NULL),
	(4, 9, 'LOW_STOCK', 1.00, '2026-08-16 11:54:37', NULL);

-- Dumping structure for table frms_db.ingredients
CREATE TABLE IF NOT EXISTS `ingredients` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'e.g. kg, litre, unit',
  `unit_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `threshold_qty` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT 'Minimum safety stock level',
  `category` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ingredients_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table frms_db.ingredients: ~7 rows (approximately)
INSERT INTO `ingredients` (`id`, `name`, `unit`, `unit_price`, `threshold_qty`, `category`, `created_at`, `updated_at`) VALUES
	(6, 'Rice', 'kg', 250.00, 3.00, 'Grains', '2026-08-13 19:57:12', '2026-08-13 19:57:12'),
	(7, 'Chicken', 'kg', 1500.00, 3.00, 'Meets', '2026-08-14 12:15:49', '2026-08-14 12:15:49'),
	(8, 'Carrot', 'kg', 239.00, 10.00, 'Vegetables', '2026-08-16 06:07:22', '2026-08-16 17:01:43'),
	(9, 'leeks', 'kg', 200.00, 3.00, 'Vegetables', '2026-08-16 09:11:31', '2026-08-16 17:02:11'),
	(11, 'flour', 'kg', 250.00, 6.00, 'grains', '2026-08-16 11:50:22', '2026-08-16 17:01:53'),
	(18, 'Coffee', 'kg', 1.00, 2.00, 'Powder', '2026-08-16 16:53:46', '2026-08-16 16:53:46'),
	(19, 'chili powder', 'kg', 400.00, 2.00, 'spices', '2026-08-16 16:57:01', '2026-08-16 16:57:01'),
	(20, 'Pepper', 'kg', 400.00, 2.00, 'spices', '2026-08-16 17:26:48', '2026-08-16 17:26:48');

-- Dumping structure for table frms_db.product_ingredients
CREATE TABLE IF NOT EXISTS `product_ingredients` (
  `product_id` int unsigned NOT NULL,
  `ingredient_id` int unsigned NOT NULL,
  `qty_per_unit` decimal(10,3) NOT NULL COMMENT 'Ingredient qty consumed per 1 product sold',
  PRIMARY KEY (`product_id`,`ingredient_id`),
  KEY `fk_pi_ingredient` (`ingredient_id`),
  CONSTRAINT `fk_pi_ingredient` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_pi_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table frms_db.product_ingredients: ~13 rows (approximately)
INSERT INTO `product_ingredients` (`product_id`, `ingredient_id`, `qty_per_unit`) VALUES
	(3, 6, 1.000),
	(3, 7, 1.000),
	(6, 6, 1.000),
	(6, 7, 0.500),
	(6, 8, 1.000),
	(6, 9, 0.250),
	(18, 7, 1.000),
	(18, 8, 1.000),
	(18, 9, 1.000),
	(19, 7, 1.000),
	(19, 8, 1.000),
	(19, 9, 0.999),
	(19, 11, 1.000);

-- Dumping structure for table frms_db.products
CREATE TABLE IF NOT EXISTS `products` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `selling_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `category` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_products_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table frms_db.products: ~4 rows (approximately)
INSERT INTO `products` (`id`, `name`, `selling_price`, `category`, `created_at`, `updated_at`) VALUES
	(3, 'Chicken Rice', 850.00, 'Main Course', '2026-08-14 12:20:36', '2026-08-14 12:20:36'),
	(6, 'Vegetable Fried rice', 950.00, 'Main Course', '2026-08-16 11:53:22', '2026-08-16 11:53:22'),
	(18, 'Noodles', 900.00, 'Main Course', '2026-08-16 16:58:23', '2026-08-16 16:58:23'),
	(19, 'Pizza', 1800.00, 'Main Course', '2026-08-16 17:28:16', '2026-08-16 17:28:16');

-- Dumping structure for table frms_db.sales
CREATE TABLE IF NOT EXISTS `sales` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` int unsigned NOT NULL,
  `qty_sold` decimal(10,2) NOT NULL,
  `sale_price` decimal(10,2) NOT NULL COMMENT 'Total price charged for this sale line',
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_sales_user` (`user_id`),
  KEY `idx_sales_product_time` (`product_id`,`timestamp`),
  CONSTRAINT `fk_sales_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_sales_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table frms_db.sales: ~10 rows (approximately)
INSERT INTO `sales` (`id`, `product_id`, `qty_sold`, `sale_price`, `timestamp`, `user_id`) VALUES
	(1, 3, 1.00, 850.00, '2026-08-14 12:21:21', 5),
	(2, 3, 1.00, 850.00, '2026-08-14 16:41:41', 5),
	(3, 3, 1.00, 850.00, '2026-08-14 16:43:32', 5),
	(4, 3, 2.00, 1700.00, '2026-08-14 16:44:33', 5),
	(5, 3, 1.00, 850.00, '2026-08-14 16:46:16', 5),
	(6, 3, 1.00, 850.00, '2026-08-14 16:47:29', 5),
	(7, 3, 1.00, 850.00, '2026-08-14 16:47:40', 5),
	(8, 3, 2.00, 1700.00, '2026-08-16 00:39:00', 5),
	(9, 3, 3.00, 2550.00, '2026-08-16 11:32:48', 5),
	(10, 19, 1.00, 1800.00, '2026-08-16 11:58:50', 5);

-- Dumping structure for table frms_db.stock_levels
CREATE TABLE IF NOT EXISTS `stock_levels` (
  `ingredient_id` int unsigned NOT NULL,
  `current_qty` decimal(12,3) NOT NULL DEFAULT '0.000',
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ingredient_id`),
  CONSTRAINT `fk_sl_ingredient` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table frms_db.stock_levels: ~5 rows (approximately)
INSERT INTO `stock_levels` (`ingredient_id`, `current_qty`, `last_updated`) VALUES
	(6, 4.000, '2026-08-16 11:32:48'),
	(7, 3.950, '2026-08-16 11:59:46'),
	(8, 8.000, '2026-08-16 11:58:50'),
	(9, 1.651, '2026-08-16 11:58:50'),
	(11, 9.000, '2026-08-16 11:58:50');

-- Dumping structure for table frms_db.stock_movements
CREATE TABLE IF NOT EXISTS `stock_movements` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ingredient_id` int unsigned NOT NULL,
  `movement_type` enum('IN','OUT','WASTE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `qty` decimal(12,3) NOT NULL,
  `reference` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'e.g. delivery note #, sale id, waste event id',
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_sm_user` (`user_id`),
  KEY `idx_sm_ingredient_time` (`ingredient_id`,`timestamp`),
  KEY `idx_sm_type` (`movement_type`),
  CONSTRAINT `fk_sm_ingredient` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_sm_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table frms_db.stock_movements: ~43 rows (approximately)
INSERT INTO `stock_movements` (`id`, `ingredient_id`, `movement_type`, `qty`, `reference`, `timestamp`, `user_id`) VALUES
	(5, 6, 'IN', 10.000, 'PO-002', '2026-08-13 19:57:29', 5),
	(6, 7, 'IN', 3.000, 'Invoice 02', '2026-08-14 12:16:13', 5),
	(7, 7, 'IN', 5.000, 'po-03', '2026-08-14 12:17:20', 5),
	(8, 6, 'OUT', 1.000, 'sale:1', '2026-08-14 12:21:21', 5),
	(9, 7, 'OUT', 1.000, 'sale:1', '2026-08-14 12:21:21', 5),
	(11, 6, 'OUT', 1.000, 'sale:2', '2026-08-14 16:41:41', 5),
	(12, 7, 'OUT', 1.000, 'sale:2', '2026-08-14 16:41:41', 5),
	(14, 6, 'OUT', 1.000, 'sale:3', '2026-08-14 16:43:32', 5),
	(15, 7, 'OUT', 1.000, 'sale:3', '2026-08-14 16:43:32', 5),
	(17, 6, 'OUT', 2.000, 'sale:4', '2026-08-14 16:44:33', 5),
	(18, 7, 'OUT', 2.000, 'sale:4', '2026-08-14 16:44:33', 5),
	(20, 6, 'OUT', 1.000, 'sale:5', '2026-08-14 16:46:16', 5),
	(21, 7, 'OUT', 1.000, 'sale:5', '2026-08-14 16:46:16', 5),
	(23, 6, 'OUT', 1.000, 'sale:6', '2026-08-14 16:47:29', 5),
	(24, 7, 'OUT', 1.000, 'sale:6', '2026-08-14 16:47:29', 5),
	(26, 6, 'OUT', 1.000, 'sale:7', '2026-08-14 16:47:40', 5),
	(27, 7, 'OUT', 1.000, 'sale:7', '2026-08-14 16:47:40', 5),
	(29, 6, 'IN', 5.000, '00251', '2026-08-14 17:09:38', 5),
	(30, 7, 'IN', 4.000, '4584', '2026-08-14 17:09:52', 5),
	(31, 6, 'WASTE', 1.000, 'waste:1', '2026-08-14 12:58:12', 5),
	(32, 6, 'WASTE', 1.000, 'waste:2', '2026-08-14 13:09:03', 5),
	(33, 6, 'OUT', 2.000, 'sale:8', '2026-08-16 00:39:00', 5),
	(34, 7, 'OUT', 2.000, 'sale:8', '2026-08-16 00:39:00', 5),
	(36, 8, 'WASTE', 1.000, 'waste:3', '2026-08-16 00:39:16', 5),
	(37, 7, 'WASTE', 1.000, 'waste:4', '2026-08-16 01:30:01', 5),
	(38, 7, 'WASTE', 1.000, 'waste:5', '2026-08-16 04:23:07', 5),
	(39, 11, 'IN', 3.000, '009', '2026-08-16 11:50:46', 5),
	(40, 11, 'IN', 5.000, '008', '2026-08-16 11:50:55', 5),
	(41, 6, 'IN', 5.000, '0010', '2026-08-16 11:51:28', 5),
	(42, 9, 'WASTE', 0.350, 'waste:6', '2026-08-16 06:24:38', 5),
	(43, 7, 'IN', 4.000, '0010', '2026-08-16 14:27:31', 5),
	(44, 11, 'IN', 1.000, '0990', '2026-08-16 16:36:54', 5),
	(45, 11, 'IN', 1.000, '013', '2026-08-16 16:37:19', 5),
	(46, 8, 'IN', 10.000, '0901', '2026-08-16 16:40:12', 5),
	(47, 6, 'WASTE', 1.000, 'waste:7', '2026-08-16 11:21:03', 5),
	(48, 9, 'IN', 3.000, '009', '2026-08-16 16:55:54', 5),
	(49, 6, 'OUT', 3.000, 'sale:9', '2026-08-16 11:32:48', 5),
	(50, 7, 'OUT', 3.000, 'sale:9', '2026-08-16 11:32:48', 5),
	(52, 7, 'IN', 4.000, '0010', '2026-08-16 17:25:37', 5),
	(53, 7, 'OUT', 1.000, 'sale:10', '2026-08-16 11:58:50', 5),
	(54, 8, 'OUT', 1.000, 'sale:10', '2026-08-16 11:58:50', 5),
	(55, 9, 'OUT', 0.999, 'sale:10', '2026-08-16 11:58:50', 5),
	(56, 11, 'OUT', 1.000, 'sale:10', '2026-08-16 11:58:50', 5),
	(60, 7, 'WASTE', 0.050, 'waste:8', '2026-08-16 11:59:46', 5);

-- Dumping structure for table frms_db.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','manager','staff') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'staff',
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table frms_db.users: ~2 rows (approximately)
INSERT INTO `users` (`id`, `name`, `email`, `role`, `password_hash`, `created_at`, `updated_at`) VALUES
	(4, 'SankaUdeshika', 'sankaudeshika123@gmail.com', 'staff', 'b926e929192ee30e047ab90fc9d1e0d811a4ccc5f0411da2047abfccc8cd8f60', '2026-08-12 19:13:16', '2026-08-12 19:13:16'),
	(5, 'Udara', 'Udara@gmail.com', 'staff', '4933088263848d45d55f8e8283f3b1362d05e921a9e6ce097d4c5b47e13c33f3', '2026-08-13 16:23:26', '2026-08-13 16:23:26');

-- Dumping structure for view frms_db.v_low_stock_alerts
-- Creating temporary table to overcome VIEW dependency errors
CREATE TABLE `v_low_stock_alerts` (
	`alert_id` BIGINT UNSIGNED NOT NULL,
	`ingredient_name` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`current_qty` DECIMAL(12,3) NOT NULL,
	`threshold_qty` DECIMAL(10,2) NOT NULL COMMENT 'Minimum safety stock level',
	`triggered_at` TIMESTAMP NOT NULL,
	`resolved_at` TIMESTAMP NULL
);

-- Dumping structure for view frms_db.v_sales_report
-- Creating temporary table to overcome VIEW dependency errors
CREATE TABLE `v_sales_report` (
	`product_name` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`num_sales` BIGINT NOT NULL,
	`total_qty_sold` DECIMAL(32,2) NULL,
	`total_revenue` DECIMAL(32,2) NULL
);

-- Dumping structure for view frms_db.v_waste_report
-- Creating temporary table to overcome VIEW dependency errors
CREATE TABLE `v_waste_report` (
	`ingredient_name` VARCHAR(1) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`waste_category` ENUM('KITCHEN_SPOILAGE','PREPARATION_TRIMMINGS','UNSOLD_LEFTOVERS','CUSTOMER_PLATE_WASTE') NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`total_qty_wasted` DECIMAL(32,3) NULL,
	`estimated_financial_loss` DECIMAL(42,5) NULL
);

-- Dumping structure for table frms_db.waste_events
CREATE TABLE IF NOT EXISTS `waste_events` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ingredient_id` int unsigned NOT NULL,
  `qty_wasted` decimal(10,3) NOT NULL,
  `waste_category` enum('KITCHEN_SPOILAGE','PREPARATION_TRIMMINGS','UNSOLD_LEFTOVERS','CUSTOMER_PLATE_WASTE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_waste_user` (`user_id`),
  KEY `idx_waste_ingredient_time` (`ingredient_id`,`timestamp`),
  KEY `idx_waste_category` (`waste_category`),
  CONSTRAINT `fk_waste_ingredient` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_waste_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table frms_db.waste_events: ~8 rows (approximately)
INSERT INTO `waste_events` (`id`, `ingredient_id`, `qty_wasted`, `waste_category`, `reason`, `timestamp`, `user_id`) VALUES
	(1, 6, 1.000, 'PREPARATION_TRIMMINGS', 'Test', '2026-08-14 12:58:12', 5),
	(2, 6, 1.000, 'KITCHEN_SPOILAGE', 'Testing 1', '2026-08-14 13:09:03', 5),
	(3, 8, 1.000, 'PREPARATION_TRIMMINGS', '', '2026-08-16 00:39:16', 5),
	(4, 7, 1.000, 'KITCHEN_SPOILAGE', '', '2026-08-16 01:30:01', 5),
	(5, 7, 1.000, 'UNSOLD_LEFTOVERS', '', '2026-08-16 04:23:07', 5),
	(6, 9, 0.350, 'CUSTOMER_PLATE_WASTE', '', '2026-08-16 06:24:38', 5),
	(7, 6, 1.000, 'PREPARATION_TRIMMINGS', '', '2026-08-16 11:21:03', 5),
	(8, 7, 0.050, 'CUSTOMER_PLATE_WASTE', '', '2026-08-16 11:59:46', 5);

-- Dumping structure for trigger frms_db.trg_sales_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `trg_sales_after_insert` AFTER INSERT ON `sales` FOR EACH ROW BEGIN
    INSERT INTO stock_movements (ingredient_id, movement_type, qty, reference, timestamp, user_id)
    SELECT pi.ingredient_id, 'OUT', pi.qty_per_unit * NEW.qty_sold,
           CONCAT('sale:', NEW.id), NEW.timestamp, NEW.user_id
    FROM product_ingredients pi
    WHERE pi.product_id = NEW.product_id;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Dumping structure for trigger frms_db.trg_stock_movements_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `trg_stock_movements_after_insert` AFTER INSERT ON `stock_movements` FOR EACH ROW BEGIN
    INSERT INTO stock_levels (ingredient_id, current_qty, last_updated)
    VALUES (
        NEW.ingredient_id,
        CASE WHEN NEW.movement_type = 'IN' THEN NEW.qty ELSE -NEW.qty END,
        NEW.timestamp
    )
    ON DUPLICATE KEY UPDATE
        current_qty = current_qty + CASE WHEN NEW.movement_type = 'IN' THEN NEW.qty ELSE -NEW.qty END,
        last_updated = NEW.timestamp;

    -- Raise a low-stock alert if the ingredient has dropped below its threshold
    -- and there isn't already an unresolved alert for it.
    INSERT INTO alerts (ingredient_id, alert_type, threshold, triggered_at)
    SELECT sl.ingredient_id, 'LOW_STOCK', i.threshold_qty, NOW()
    FROM stock_levels sl
    JOIN ingredients i ON i.id = sl.ingredient_id
    WHERE sl.ingredient_id = NEW.ingredient_id
      AND sl.current_qty < i.threshold_qty
      AND NOT EXISTS (
          SELECT 1 FROM alerts a
          WHERE a.ingredient_id = NEW.ingredient_id
            AND a.resolved_at IS NULL
      );
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Dumping structure for trigger frms_db.trg_waste_events_after_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `trg_waste_events_after_insert` AFTER INSERT ON `waste_events` FOR EACH ROW BEGIN
    INSERT INTO stock_movements (ingredient_id, movement_type, qty, reference, timestamp, user_id)
    VALUES (NEW.ingredient_id, 'WASTE', NEW.qty_wasted,
            CONCAT('waste:', NEW.id), NEW.timestamp, NEW.user_id);
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Removing temporary table and create final VIEW structure
DROP TABLE IF EXISTS `v_low_stock_alerts`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `v_low_stock_alerts` AS select `a`.`id` AS `alert_id`,`i`.`name` AS `ingredient_name`,`sl`.`current_qty` AS `current_qty`,`i`.`threshold_qty` AS `threshold_qty`,`a`.`triggered_at` AS `triggered_at`,`a`.`resolved_at` AS `resolved_at` from ((`alerts` `a` join `ingredients` `i` on((`i`.`id` = `a`.`ingredient_id`))) join `stock_levels` `sl` on((`sl`.`ingredient_id` = `a`.`ingredient_id`))) where (`a`.`resolved_at` is null)
;

-- Removing temporary table and create final VIEW structure
DROP TABLE IF EXISTS `v_sales_report`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `v_sales_report` AS select `p`.`name` AS `product_name`,count(`s`.`id`) AS `num_sales`,sum(`s`.`qty_sold`) AS `total_qty_sold`,sum(`s`.`sale_price`) AS `total_revenue` from (`sales` `s` join `products` `p` on((`p`.`id` = `s`.`product_id`))) group by `p`.`name`
;

-- Removing temporary table and create final VIEW structure
DROP TABLE IF EXISTS `v_waste_report`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `v_waste_report` AS select `i`.`name` AS `ingredient_name`,`w`.`waste_category` AS `waste_category`,sum(`w`.`qty_wasted`) AS `total_qty_wasted`,sum((`w`.`qty_wasted` * `i`.`unit_price`)) AS `estimated_financial_loss` from (`waste_events` `w` join `ingredients` `i` on((`i`.`id` = `w`.`ingredient_id`))) group by `i`.`name`,`w`.`waste_category`
;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
