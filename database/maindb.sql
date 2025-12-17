CREATE DATABASE  IF NOT EXISTS `vitalsoft_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `vitalsoft_db`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: vitalsoft_db
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `approval_history`
--

DROP TABLE IF EXISTS `approval_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `approval_history` (
  `history_id` int NOT NULL AUTO_INCREMENT,
  `request_id` int NOT NULL,
  `inventory_id` int NOT NULL,
  `branch_id` int NOT NULL,
  `request_type` enum('add','update','delete') NOT NULL,
  `old_quantity` int DEFAULT NULL,
  `new_quantity` int DEFAULT NULL,
  `status` enum('approved','rejected') NOT NULL,
  `requested_by` int NOT NULL,
  `approved_by` int NOT NULL,
  `reason` text,
  `rejection_reason` text,
  `approval_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  KEY `request_id` (`request_id`),
  KEY `inventory_id` (`inventory_id`),
  KEY `branch_id` (`branch_id`),
  KEY `requested_by` (`requested_by`),
  KEY `approved_by` (`approved_by`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approval_history`
--

LOCK TABLES `approval_history` WRITE;
/*!40000 ALTER TABLE `approval_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `approval_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_log`
--

DROP TABLE IF EXISTS `audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_log` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `table_name` varchar(100) NOT NULL,
  `record_id` int DEFAULT NULL,
  `old_values` text,
  `new_values` text,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_log`
--

LOCK TABLES `audit_log` WRITE;
/*!40000 ALTER TABLE `audit_log` DISABLE KEYS */;
INSERT INTO `audit_log` VALUES (1,1,'CREATE','users',9,NULL,'{\"username\":\"patient1\",\"role\":\"Patient\"}','192.168.1.100','2025-12-17 00:01:09'),(2,3,'CREATE','prescriptions',1,NULL,'{\"patient_id\":1,\"status\":\"active\"}','192.168.1.101','2025-12-17 00:01:09'),(3,7,'UPDATE','orders',1,'{\"status\":\"pending\"}','{\"status\":\"completed\"}','192.168.1.102','2025-12-17 00:01:09'),(4,5,'UPDATE','branch_inventory',1,'{\"quantity\":150}','{\"quantity\":130}','192.168.1.103','2025-12-17 00:01:09');
/*!40000 ALTER TABLE `audit_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `branch_inventory`
--

DROP TABLE IF EXISTS `branch_inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `branch_inventory` (
  `inventory_id` int NOT NULL AUTO_INCREMENT,
  `branch_id` int NOT NULL,
  `medicine_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `reorder_level` int DEFAULT '10',
  `expiry_date` date NOT NULL,
  `batch_number` varchar(100) DEFAULT NULL,
  `status` enum('available','low_stock','expired','out_of_stock') DEFAULT 'available',
  `last_updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`inventory_id`),
  KEY `last_updated_by` (`last_updated_by`),
  KEY `idx_inventory_branch` (`branch_id`),
  KEY `idx_inventory_medicine` (`medicine_id`),
  KEY `idx_inventory_expiry` (`expiry_date`)
) ENGINE=MyISAM AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branch_inventory`
--

LOCK TABLES `branch_inventory` WRITE;
/*!40000 ALTER TABLE `branch_inventory` DISABLE KEYS */;
INSERT INTO `branch_inventory` VALUES (1,1,1,125,20,'2025-12-31','BATCH-A001','available',7,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(2,1,2,500,50,'2026-06-30','BATCH-A002','available',7,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(3,1,3,45,30,'2025-11-30','BATCH-A003','low_stock',7,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(4,1,4,200,25,'2025-10-31','BATCH-A004','available',7,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(5,1,5,100,15,'2026-03-31','BATCH-A005','available',7,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(6,1,6,120,20,'2025-09-30','BATCH-A006','available',7,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(7,1,7,80,15,'2026-01-31','BATCH-A007','available',7,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(8,1,8,250,40,'2026-05-31','BATCH-A008','available',7,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(9,1,9,50,10,'2025-08-31','BATCH-A009','available',7,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(10,1,10,400,60,'2026-12-31','BATCH-A010','available',7,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(11,2,1,100,20,'2025-11-30','BATCH-B001','available',9,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(12,2,2,350,50,'2026-04-30','BATCH-B002','available',9,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(13,2,3,200,30,'2025-12-31','BATCH-B003','available',9,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(14,2,4,8,25,'2025-09-30','BATCH-B004','low_stock',9,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(15,2,5,75,15,'2026-02-28','BATCH-B005','available',9,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(16,2,6,90,20,'2026-01-31','BATCH-B006','available',9,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(17,2,7,60,15,'2025-12-31','BATCH-B007','available',9,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(18,2,8,180,40,'2026-03-31','BATCH-B008','available',9,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(19,3,1,85,20,'2026-01-31','BATCH-C001','available',12,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(20,3,2,420,50,'2026-07-31','BATCH-C002','available',12,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(21,3,3,150,30,'2025-10-31','BATCH-C003','available',12,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(22,3,5,95,15,'2026-04-30','BATCH-C005','available',12,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(23,4,1,110,20,'2025-11-30','BATCH-D001','available',7,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(24,4,2,380,50,'2026-05-31','BATCH-D002','available',7,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(25,4,3,220,30,'2025-12-31','BATCH-D003','available',7,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(26,4,6,105,20,'2025-10-31','BATCH-D006','available',7,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(27,5,2,450,50,'2026-08-31','BATCH-E002','available',8,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(28,5,3,280,30,'2025-11-30','BATCH-E003','available',8,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(29,5,8,195,40,'2026-04-30','BATCH-E008','available',8,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(30,5,10,520,60,'2026-12-31','BATCH-E010','available',8,'2025-12-17 00:01:09','2025-12-17 00:01:09');
/*!40000 ALTER TABLE `branch_inventory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `branch_staff`
--

DROP TABLE IF EXISTS `branch_staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `branch_staff` (
  `assignment_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `branch_id` int NOT NULL,
  `assigned_date` date NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`assignment_id`),
  UNIQUE KEY `unique_staff_branch` (`user_id`,`branch_id`),
  KEY `branch_id` (`branch_id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branch_staff`
--

LOCK TABLES `branch_staff` WRITE;
/*!40000 ALTER TABLE `branch_staff` DISABLE KEYS */;
INSERT INTO `branch_staff` VALUES (1,7,1,'2024-01-15','active','2025-12-17 00:01:09'),(2,8,1,'2024-01-15','active','2025-12-17 00:01:09'),(3,9,2,'2024-02-01','active','2025-12-17 00:01:09'),(4,10,3,'2024-02-15','inactive','2025-12-17 00:01:09'),(5,11,2,'2024-03-01','active','2025-12-17 00:01:09'),(6,12,3,'2024-03-10','active','2025-12-17 00:01:09'),(7,7,4,'2024-04-01','active','2025-12-17 00:01:09'),(8,8,5,'2024-04-01','active','2025-12-17 00:01:09');
/*!40000 ALTER TABLE `branch_staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dispensing_history`
--

DROP TABLE IF EXISTS `dispensing_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dispensing_history` (
  `history_id` int NOT NULL AUTO_INCREMENT,
  `prescription_id` int NOT NULL,
  `medicine_id` int NOT NULL,
  `quantity_dispensed` int NOT NULL,
  `quantity_before` int NOT NULL,
  `quantity_after` int NOT NULL,
  `pharmacist_id` int NOT NULL,
  `dispensed_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  KEY `prescription_id` (`prescription_id`),
  KEY `medicine_id` (`medicine_id`),
  KEY `pharmacist_id` (`pharmacist_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dispensing_history`
--

LOCK TABLES `dispensing_history` WRITE;
/*!40000 ALTER TABLE `dispensing_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `dispensing_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_update_requests`
--

DROP TABLE IF EXISTS `inventory_update_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_update_requests` (
  `request_id` int NOT NULL AUTO_INCREMENT,
  `inventory_id` int NOT NULL,
  `requested_by` int NOT NULL,
  `request_type` enum('add','update','delete') NOT NULL,
  `old_quantity` int DEFAULT NULL,
  `new_quantity` int DEFAULT NULL,
  `reason` text,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `approved_by` int DEFAULT NULL,
  `approval_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`request_id`),
  KEY `inventory_id` (`inventory_id`),
  KEY `requested_by` (`requested_by`),
  KEY `approved_by` (`approved_by`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_update_requests`
--

LOCK TABLES `inventory_update_requests` WRITE;
/*!40000 ALTER TABLE `inventory_update_requests` DISABLE KEYS */;
INSERT INTO `inventory_update_requests` VALUES (1,1,7,'update',125,104,'Stock dispensed for patient prescriptions - 21 units','pending',NULL,NULL,'2025-12-17 00:01:09'),(2,4,9,'update',8,18,'Received new stock shipment from supplier','pending',NULL,NULL,'2025-12-17 00:01:09'),(3,14,9,'update',8,8,'Price increase from $12.00 to $12.50 due to supplier cost change','pending',NULL,NULL,'2025-12-17 00:01:09'),(4,1,7,'update',150,130,'Stock dispensed for multiple prescriptions','approved',5,'2024-10-15 07:00:00','2025-12-17 00:01:09'),(5,2,7,'update',500,486,'Daily dispensing adjustments','approved',5,'2024-10-15 07:00:00','2025-12-17 00:01:09'),(6,3,7,'update',45,50,'Emergency restock from warehouse','rejected',5,'2024-11-01 02:30:00','2025-12-17 00:01:09'),(7,14,9,'update',10,8,'Dispensed to patient','approved',5,'2024-10-28 06:20:00','2025-12-17 00:01:09');
/*!40000 ALTER TABLE `inventory_update_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medical_history`
--

DROP TABLE IF EXISTS `medical_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medical_history` (
  `history_id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `diagnosis` text NOT NULL,
  `notes` text,
  `visit_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `idx_medical_history_patient` (`patient_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_history`
--

LOCK TABLES `medical_history` WRITE;
/*!40000 ALTER TABLE `medical_history` DISABLE KEYS */;
INSERT INTO `medical_history` VALUES (1,1,3,'Upper Respiratory Tract Infection','Patient presents with cough and fever. Prescribed antibiotics.','2024-10-15','2025-12-17 00:01:09','2025-12-17 00:01:09'),(2,1,3,'Follow-up Visit','Patient showing improvement. Continue medication.','2024-10-22','2025-12-17 00:01:09','2025-12-17 00:01:09'),(3,2,4,'Hypertension','Blood pressure reading 150/95. Started on antihypertensive medication.','2024-09-20','2025-12-17 00:01:09','2025-12-17 00:01:09'),(4,2,3,'Allergic Rhinitis','Seasonal allergies. Prescribed antihistamine.','2024-10-28','2025-12-17 00:01:09','2025-12-17 00:01:09');
/*!40000 ALTER TABLE `medical_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicines`
--

DROP TABLE IF EXISTS `medicines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicines` (
  `medicine_id` int NOT NULL AUTO_INCREMENT,
  `medicine_name` varchar(200) NOT NULL,
  `generic_name` varchar(200) DEFAULT NULL,
  `manufacturer` varchar(200) DEFAULT NULL,
  `description` text,
  `dosage_form` varchar(100) DEFAULT NULL,
  `strength` varchar(100) DEFAULT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `requires_prescription` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`medicine_id`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicines`
--

LOCK TABLES `medicines` WRITE;
/*!40000 ALTER TABLE `medicines` DISABLE KEYS */;
INSERT INTO `medicines` VALUES (1,'Amoxicillin','Amoxicillin','PharmaCorp','Antibiotic for bacterial infections','Capsule','500mg',15.50,1,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(2,'Paracetamol','Acetaminophen','GenericMed','Pain reliever and fever reducer','Tablet','500mg',5.00,0,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(3,'Ibuprofen','Ibuprofen','PainRelief Inc','Anti-inflammatory pain reliever','Tablet','400mg',8.00,0,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(4,'Metformin','Metformin HCl','DiabetesCare','Diabetes medication','Tablet','500mg',12.00,1,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(5,'Omeprazole','Omeprazole','GastroMed','Proton pump inhibitor for acid reflux','Capsule','20mg',18.00,1,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(6,'Losartan','Losartan Potassium','CardioPharm','Blood pressure medication','Tablet','50mg',20.00,1,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(7,'Atorvastatin','Atorvastatin','CholesterolCare','Cholesterol-lowering medication','Tablet','20mg',25.00,1,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(8,'Cetirizine','Cetirizine HCl','AllergyFree','Antihistamine for allergies','Tablet','10mg',6.50,0,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(9,'Salbutamol','Salbutamol','RespiraCare','Bronchodilator for asthma','Inhaler','100mcg',35.00,1,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(10,'Vitamin C','Ascorbic Acid','VitaHealth','Vitamin supplement','Tablet','500mg',10.00,0,'2025-12-17 00:01:09','2025-12-17 00:01:09');
/*!40000 ALTER TABLE `medicines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `medicine_id` int NOT NULL,
  `inventory_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_item_id`),
  KEY `order_id` (`order_id`),
  KEY `medicine_id` (`medicine_id`),
  KEY `inventory_id` (`inventory_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,1,1,21,15.50,325.50,'2025-12-17 00:01:09'),(2,1,2,2,14,5.00,70.00,'2025-12-17 00:01:09'),(3,2,6,6,90,20.00,1800.00,'2025-12-17 00:01:09'),(4,3,8,13,30,6.50,195.00,'2025-12-17 00:01:09');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `prescription_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `branch_id` int NOT NULL,
  `pharmacist_id` int NOT NULL,
  `order_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','completed','cancelled') DEFAULT 'pending',
  `payment_status` enum('unpaid','paid','refunded') DEFAULT 'unpaid',
  `dispensed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  KEY `prescription_id` (`prescription_id`),
  KEY `pharmacist_id` (`pharmacist_id`),
  KEY `idx_orders_patient` (`patient_id`),
  KEY `idx_orders_branch` (`branch_id`),
  KEY `idx_orders_date` (`order_date`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,1,1,1,7,'2024-10-15 06:30:00',395.50,'completed','paid','2024-10-15 06:45:00','2025-12-17 00:01:09','2025-12-17 00:01:09'),(2,2,2,1,7,'2024-09-20 02:15:00',1800.00,'completed','paid','2024-09-20 02:30:00','2025-12-17 00:01:09','2025-12-17 00:01:09'),(3,3,2,2,8,'2024-10-28 08:20:00',195.00,'completed','paid','2024-10-28 08:35:00','2025-12-17 00:01:09','2025-12-17 00:01:09');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patients` (
  `patient_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `insurance_number` varchar(100) DEFAULT NULL,
  `insurance_provider` varchar(200) DEFAULT NULL,
  `emergency_contact_name` varchar(200) DEFAULT NULL,
  `emergency_contact_phone` varchar(20) DEFAULT NULL,
  `blood_type` varchar(10) DEFAULT NULL,
  `allergies` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`patient_id`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES (1,9,'INS-001-2024','HealthCare Plus','John Thompson','+1234567900','O+','Penicillin','2025-12-17 00:01:09','2025-12-17 00:01:09'),(2,10,'INS-002-2024','MediCare Shield','Sarah White','+1234567901','A+','None','2025-12-17 00:01:09','2025-12-17 00:01:09'),(3,11,'INS001234','Blue Cross','Jane Doe','555-0101','B+','None','2025-12-17 00:01:09','2025-12-17 00:01:09'),(4,12,'INS005678','Aetna','James Smith','555-0102','A-','Sulfa drugs','2025-12-17 00:01:09','2025-12-17 00:01:09'),(5,13,'INS009012','Cigna','Patricia Johnson','555-0103','O+','Aspirin','2025-12-17 00:01:09','2025-12-17 00:01:09'),(6,14,'INS003456','United Healthcare','Michael Wilson','555-0104','B-','Codeine','2025-12-17 00:01:09','2025-12-17 00:01:09'),(7,15,'INS007890','Humana','David Brown','555-0105','AB+','None','2025-12-17 00:01:09','2025-12-17 00:01:09');
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_methods`
--

DROP TABLE IF EXISTS `payment_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_methods` (
  `payment_method_id` int NOT NULL AUTO_INCREMENT,
  `method_name` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_method_id`),
  UNIQUE KEY `method_name` (`method_name`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_methods`
--

LOCK TABLES `payment_methods` WRITE;
/*!40000 ALTER TABLE `payment_methods` DISABLE KEYS */;
INSERT INTO `payment_methods` VALUES (1,'Cash',1,'2025-12-17 00:01:09'),(2,'Credit Card',1,'2025-12-17 00:01:09'),(3,'Debit Card',1,'2025-12-17 00:01:09'),(4,'Insurance',1,'2025-12-17 00:01:09'),(5,'E-Wallet',1,'2025-12-17 00:01:09'),(6,'Bank Transfer',1,'2025-12-17 00:01:09');
/*!40000 ALTER TABLE `payment_methods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `payment_method_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `transaction_reference` varchar(200) DEFAULT NULL,
  `payment_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  KEY `order_id` (`order_id`),
  KEY `payment_method_id` (`payment_method_id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,1,395.50,'CASH-20241015-001','2024-10-15 06:45:00','completed','2025-12-17 00:01:09'),(2,2,4,1800.00,'INS-20240920-002','2024-09-20 02:30:00','completed','2025-12-17 00:01:09'),(3,3,2,195.00,'CC-20241028-003','2024-10-28 08:35:00','completed','2025-12-17 00:01:09');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pharmacy_branches`
--

DROP TABLE IF EXISTS `pharmacy_branches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pharmacy_branches` (
  `branch_id` int NOT NULL AUTO_INCREMENT,
  `branch_name` varchar(200) NOT NULL,
  `branch_code` varchar(50) NOT NULL,
  `address` text NOT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL,
  `manager_id` int DEFAULT NULL,
  `status` enum('active','inactive','under_maintenance') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`branch_id`),
  UNIQUE KEY `branch_code` (`branch_code`),
  KEY `manager_id` (`manager_id`),
  KEY `idx_branch_status` (`status`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pharmacy_branches`
--

LOCK TABLES `pharmacy_branches` WRITE;
/*!40000 ALTER TABLE `pharmacy_branches` DISABLE KEYS */;
INSERT INTO `pharmacy_branches` VALUES (1,'Downtown Pharmacy','PH-DOWN-001','123 Main Street, Downtown','Metro City','Metro Manila','1000','(555) 123-4567','downtown@pharmacy.com',5,'active','2025-12-17 00:01:09','2025-12-17 00:01:09'),(2,'Westside Pharmacy','PH-WEST-002','456 Oak Avenue, Westside','Quezon City','Metro Manila','1100','(555) 234-5678','westside@pharmacy.com',5,'active','2025-12-17 00:01:09','2025-12-17 00:01:09'),(3,'Northside Pharmacy','PH-NORTH-003','789 Pine Road, Northside','Pasig City','Metro Manila','1600','(555) 345-6789','northside@pharmacy.com',5,'inactive','2025-12-17 00:01:09','2025-12-17 00:01:09'),(4,'East Mall Pharmacy','PH-EAST-004','321 Eastern Blvd','Makati City','Metro Manila','1200','(555) 456-7890','eastmall@pharmacy.com',5,'active','2025-12-17 00:01:09','2025-12-17 00:01:09'),(5,'South Branch Pharmacy','PH-SOUTH-005','654 Southern Ave','Taguig City','Metro Manila','1630','(555) 567-8901','south@pharmacy.com',6,'active','2025-12-17 00:01:09','2025-12-17 00:01:09');
/*!40000 ALTER TABLE `pharmacy_branches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescription_items`
--

DROP TABLE IF EXISTS `prescription_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescription_items` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `prescription_id` int NOT NULL,
  `medicine_id` int NOT NULL,
  `dosage` varchar(100) NOT NULL,
  `quantity` int NOT NULL,
  `dispensed_quantity` int DEFAULT '0',
  `remaining_quantity` int DEFAULT NULL,
  `frequency` varchar(200) DEFAULT NULL,
  `duration` varchar(100) DEFAULT NULL,
  `instructions` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`item_id`),
  KEY `prescription_id` (`prescription_id`),
  KEY `medicine_id` (`medicine_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription_items`
--

LOCK TABLES `prescription_items` WRITE;
/*!40000 ALTER TABLE `prescription_items` DISABLE KEYS */;
INSERT INTO `prescription_items` VALUES (1,1,1,'500mg',21,21,0,'Three times daily','7 days','Take one capsule after meals','2025-12-17 00:01:09','2025-12-17 00:01:09'),(2,1,2,'500mg',14,14,0,'Twice daily as needed','7 days','For fever or pain','2025-12-17 00:01:09','2025-12-17 00:01:09'),(3,2,6,'50mg',90,0,90,'Once daily','90 days','Take in the morning','2025-12-17 00:01:09','2025-12-17 00:01:09'),(4,3,8,'10mg',30,0,30,'Once daily','30 days','Take at bedtime','2025-12-17 00:01:09','2025-12-17 00:01:09');
/*!40000 ALTER TABLE `prescription_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescription_renewals`
--

DROP TABLE IF EXISTS `prescription_renewals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescription_renewals` (
  `renewal_id` int NOT NULL AUTO_INCREMENT,
  `prescription_id` int NOT NULL,
  `requested_by` int NOT NULL,
  `request_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `reviewed_by` int DEFAULT NULL,
  `review_date` timestamp NULL DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`renewal_id`),
  KEY `prescription_id` (`prescription_id`),
  KEY `requested_by` (`requested_by`),
  KEY `reviewed_by` (`reviewed_by`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription_renewals`
--

LOCK TABLES `prescription_renewals` WRITE;
/*!40000 ALTER TABLE `prescription_renewals` DISABLE KEYS */;
INSERT INTO `prescription_renewals` VALUES (1,2,10,'2024-11-01 01:00:00','approved',4,'2024-11-01 06:30:00','Patient showing good response to medication. Approved for renewal.'),(2,3,10,'2024-12-10 02:30:00','pending',NULL,NULL,'Running low on medication, need refill soon.'),(3,2,10,'2024-12-11 07:45:00','pending',NULL,NULL,'Requesting early renewal due to travel plans next month.');
/*!40000 ALTER TABLE `prescription_renewals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescriptions`
--

DROP TABLE IF EXISTS `prescriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescriptions` (
  `prescription_id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `prescription_date` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `diagnosis` text,
  `notes` text,
  `status` enum('active','dispensed','expired','cancelled','pending','partially_dispensed','fulfilled') DEFAULT 'pending',
  `renewal_requested` tinyint(1) DEFAULT '0',
  `prescribed_quantity` int DEFAULT NULL,
  `dispensed_quantity` int DEFAULT '0',
  `remaining_quantity` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`prescription_id`),
  KEY `idx_prescriptions_patient` (`patient_id`),
  KEY `idx_prescriptions_doctor` (`doctor_id`),
  KEY `idx_prescriptions_status` (`status`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescriptions`
--

LOCK TABLES `prescriptions` WRITE;
/*!40000 ALTER TABLE `prescriptions` DISABLE KEYS */;
INSERT INTO `prescriptions` VALUES (1,1,3,'2024-10-15','2024-11-15','Upper Respiratory Tract Infection','Take with food','fulfilled',0,35,35,0,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(2,2,4,'2024-09-20','2025-03-20','Hypertension','Take once daily in the morning','pending',0,90,0,90,'2025-12-17 00:01:09','2025-12-17 00:01:09'),(3,2,3,'2024-10-28','2025-01-28','Allergic Rhinitis','Take as needed for symptoms','pending',0,30,0,30,'2025-12-17 00:01:09','2025-12-17 00:01:09');
/*!40000 ALTER TABLE `prescriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Admin','System administrator with full access','2025-12-17 00:01:09'),(2,'Doctor','Medical doctor who can prescribe medications','2025-12-17 00:01:09'),(3,'Pharmacist','Pharmacy employee who dispenses medications','2025-12-17 00:01:09'),(4,'Pharmacy Manager','Manager of pharmacy branches','2025-12-17 00:01:09'),(5,'Patient','Patient who receives prescriptions','2025-12-17 00:01:09');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `support_tickets`
--

DROP TABLE IF EXISTS `support_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `support_tickets` (
  `ticket_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `subject` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `status` enum('open','in_progress','resolved','closed') DEFAULT 'open',
  `assigned_to` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `resolved_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`ticket_id`),
  KEY `assigned_to` (`assigned_to`),
  KEY `idx_support_tickets_user` (`user_id`),
  KEY `idx_support_tickets_status` (`status`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `support_tickets`
--

LOCK TABLES `support_tickets` WRITE;
/*!40000 ALTER TABLE `support_tickets` DISABLE KEYS */;
INSERT INTO `support_tickets` VALUES (1,9,'Cannot access prescription history','I am unable to view my past prescriptions on the portal','high','in_progress',1,'2025-12-17 00:01:09','2025-12-17 00:01:09',NULL),(2,10,'Update insurance information','Need to update my insurance provider details','medium','open',1,'2025-12-17 00:01:09','2025-12-17 00:01:09',NULL);
/*!40000 ALTER TABLE `support_tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role_id` int NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `gender` enum('Male','Female','Other','Prefer not to say') DEFAULT 'Prefer not to say',
  `phone_number` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `address` text,
  `status` enum('active','inactive','deactivated') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `created_by` (`created_by`),
  KEY `idx_users_status` (`status`),
  KEY `idx_users_role` (`role_id`)
) ENGINE=MyISAM AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','admin@pharmacy.com','$2y$10$YourSystemWillGenerateThis.OnFirstRun.UseUpdateScript',1,'John','Anderson','Male','+1234567890','1980-05-15','123 Admin St, City, State','active','2025-12-17 00:01:09','2025-12-17 00:01:09',NULL),(2,'admin2','admin2@pharmacy.com','$2y$10$YourSystemWillGenerateThis.OnFirstRun.UseUpdateScript',1,'Jane','Williams','Female','+1234567891','1982-07-20','124 Admin St, City, State','active','2025-12-17 00:01:09','2025-12-17 00:01:09',NULL),(3,'doctor','dr.smith@hospital.com','$2y$10$YourSystemWillGenerateThis.OnFirstRun.UseUpdateScript',2,'Sarah','Smith','Female','+1234567892','1975-08-22','456 Medical Ave, City, State','active','2025-12-17 00:01:09','2025-12-17 00:01:09',NULL),(4,'doctor2','dr.johnson@hospital.com','$2y$10$YourSystemWillGenerateThis.OnFirstRun.UseUpdateScript',2,'Michael','Johnson','Male','+1234567893','1982-03-10','789 Health Blvd, City, State','active','2025-12-17 00:01:09','2025-12-17 00:01:09',NULL),(5,'manager','manager1@pharmacy.com','$2y$10$YourSystemWillGenerateThis.OnFirstRun.UseUpdateScript',4,'Emily','Davis','Female','+1234567894','1985-11-30','321 Manager Rd, City, State','active','2025-12-17 00:01:09','2025-12-17 00:01:09',NULL),(6,'manager2','manager2@pharmacy.com','$2y$10$YourSystemWillGenerateThis.OnFirstRun.UseUpdateScript',4,'Robert','Wilson','Male','+1234567895','1978-06-18','654 Branch St, City, State','active','2025-12-17 00:01:09','2025-12-17 00:01:09',NULL),(7,'pharmacist','pharmacist1@pharmacy.com','$2y$10$YourSystemWillGenerateThis.OnFirstRun.UseUpdateScript',3,'Michael','Chen','Male','+1234567896','1990-02-14','987 Pharmacy Ln, City, State','active','2025-12-17 00:01:09','2025-12-17 00:01:09',NULL),(8,'pharmacist2','pharmacist2@pharmacy.com','$2y$10$YourSystemWillGenerateThis.OnFirstRun.UseUpdateScript',3,'Sarah','Johnson','Female','+1234567897','1988-09-25','147 Medicine Way, City, State','active','2025-12-17 00:01:09','2025-12-17 00:01:09',NULL),(9,'patient','patient1@email.com','$2y$10$YourSystemWillGenerateThis.OnFirstRun.UseUpdateScript',5,'Maria','Thompson','Female','+1234567904','1995-07-12','741 Patient Ave, City, State','active','2025-12-17 00:01:09','2025-12-17 00:01:09',NULL),(10,'patient2','patient2@email.com','$2y$10$YourSystemWillGenerateThis.OnFirstRun.UseUpdateScript',5,'Christopher','White','Male','+1234567905','1989-01-28','852 Wellness Rd, City, State','active','2025-12-17 00:01:09','2025-12-17 00:01:09',NULL),(11,'patient3','patient3@email.com','$2y$10$YourSystemWillGenerateThis.OnFirstRun.UseUpdateScript',5,'John','Doe','Male','555-0101','1985-03-15','123 Main St, City, State 12345','active','2025-12-17 00:01:09','2025-12-17 00:01:09',NULL),(12,'patient4','patient4@email.com','$2y$10$YourSystemWillGenerateThis.OnFirstRun.UseUpdateScript',5,'Mary','Smith','Female','555-0102','1990-07-22','456 Oak Ave, Town, State 67890','active','2025-12-17 00:01:09','2025-12-17 00:01:09',NULL),(13,'patient5','patient5@email.com','$2y$10$YourSystemWillGenerateThis.OnFirstRun.UseUpdateScript',5,'Robert','Johnson','Male','555-0103','1978-11-08','789 Pine Rd, Village, State 24680','active','2025-12-17 00:01:09','2025-12-17 00:01:09',NULL),(14,'patient6','patient6@email.com','$2y$10$YourSystemWillGenerateThis.OnFirstRun.UseUpdateScript',5,'Emma','Wilson','Female','555-0104','1992-05-30','321 Elm St, District, State 13579','active','2025-12-17 00:01:09','2025-12-17 00:01:09',NULL),(15,'patient7','patient7@email.com','$2y$10$YourSystemWillGenerateThis.OnFirstRun.UseUpdateScript',5,'Charles','Brown','Male','555-0105','1988-09-12','654 Maple Dr, County, State 97531','active','2025-12-17 00:01:09','2025-12-17 00:01:09',NULL),(16,'suadmin','suadmin@gmail.com','suadmin',1,'Su','Admin','Male',NULL,NULL,NULL,'active','2025-12-17 00:03:40','2025-12-17 00:03:40',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-17  8:04:31
