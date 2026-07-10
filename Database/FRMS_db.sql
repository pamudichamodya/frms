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

-- Data exporting was unselected.

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

-- Data exporting was unselected.

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

-- Data exporting was unselected.

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

-- Data exporting was unselected.

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

-- Data exporting was unselected.

-- Dumping structure for table frms_db.stock_levels
CREATE TABLE IF NOT EXISTS `stock_levels` (
  `ingredient_id` int unsigned NOT NULL,
  `current_qty` decimal(12,3) NOT NULL DEFAULT '0.000',
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ingredient_id`),
  CONSTRAINT `fk_sl_ingredient` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

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

-- Data exporting was unselected.

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

-- Data exporting was unselected.

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

-- Data exporting was unselected.

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
