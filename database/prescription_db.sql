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
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin` (
  `adminid` varchar(25) NOT NULL,
  `level` enum('superuser','admin') NOT NULL,
  `date_assigned` date NOT NULL,
  `role` char(2) NOT NULL,
  UNIQUE KEY `adminid_UNIQUE` (`adminid`),
  KEY `admin role_idx` (`role`) /*!80000 INVISIBLE */,
  CONSTRAINT `admin role` FOREIGN KEY (`role`) REFERENCES `user_role` (`roleid`),
  CONSTRAINT `admin user` FOREIGN KEY (`adminid`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES ('A0001','superuser','2025-01-30','a');
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctor`
--

DROP TABLE IF EXISTS `doctor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctor` (
  `doctorid` varchar(25) NOT NULL,
  `license_no` varchar(45) NOT NULL,
  `specialization` varchar(45) NOT NULL,
  `role` char(2) NOT NULL,
  UNIQUE KEY `doctorid_UNIQUE` (`doctorid`),
  KEY `doctor user_idx` (`doctorid`),
  KEY `doctor role_idx` (`role`),
  CONSTRAINT `doctor role` FOREIGN KEY (`role`) REFERENCES `user_role` (`roleid`),
  CONSTRAINT `doctor user` FOREIGN KEY (`doctorid`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor`
--

LOCK TABLES `doctor` WRITE;
/*!40000 ALTER TABLE `doctor` DISABLE KEYS */;
INSERT INTO `doctor` VALUES ('D0001','19216800','general','d');
/*!40000 ALTER TABLE `doctor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medication_assignments`
--

DROP TABLE IF EXISTS `medication_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medication_assignments` (
  `prescripts_id` varchar(255) NOT NULL,
  `meds_id` varchar(255) NOT NULL,
  `dosage` decimal(10,0) NOT NULL,
  `meds_quantity` int NOT NULL,
  `instructions` text NOT NULL,
  `additional notes` longtext,
  PRIMARY KEY (`prescripts_id`,`meds_id`),
  KEY `meds ref_idx` (`meds_id`) /*!80000 INVISIBLE */,
  CONSTRAINT `meds ref` FOREIGN KEY (`meds_id`) REFERENCES `medicine` (`medicineid`),
  CONSTRAINT `prescripts ref` FOREIGN KEY (`prescripts_id`) REFERENCES `prescription` (`prescriptionid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='junction table for storing prescriptions with multiple assigned medicines';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medication_assignments`
--

LOCK TABLES `medication_assignments` WRITE;
/*!40000 ALTER TABLE `medication_assignments` DISABLE KEYS */;
INSERT INTO `medication_assignments` VALUES ('P0001','MED0001',500,10,'2x a day',NULL),('P0001','MED0002',500,5,'1x a day',NULL);
/*!40000 ALTER TABLE `medication_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicine`
--

DROP TABLE IF EXISTS `medicine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicine` (
  `medicineid` varchar(255) NOT NULL,
  `generic_name` varchar(45) NOT NULL,
  `brand_name` varchar(45) NOT NULL,
  `description` longtext NOT NULL,
  `category` varchar(45) NOT NULL,
  `unitprice` decimal(10,4) NOT NULL,
  `expirydate` date NOT NULL,
  `stock` int NOT NULL,
  PRIMARY KEY (`medicineid`),
  UNIQUE KEY `medicineid_UNIQUE` (`medicineid`),
  UNIQUE KEY `scientific_name_UNIQUE` (`brand_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicine`
--

LOCK TABLES `medicine` WRITE;
/*!40000 ALTER TABLE `medicine` DISABLE KEYS */;
INSERT INTO `medicine` VALUES ('MED0001','acetaminophen','Tylenol','for pain reliever','analgesic, antipyretics',10.0000,'2027-11-18',200),('MED0002','acetaminophen','Panadol','for pain reliever','analgesic, antipyretics',12.0000,'2027-11-18',50);
/*!40000 ALTER TABLE `medicine` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient`
--

DROP TABLE IF EXISTS `patient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient` (
  `patientid` varchar(25) NOT NULL,
  `birthdate` date NOT NULL,
  `gender` enum('male','female') NOT NULL,
  `role` char(2) NOT NULL,
  UNIQUE KEY `userid_UNIQUE` (`patientid`),
  KEY `patient role_idx` (`role`),
  CONSTRAINT `patient role` FOREIGN KEY (`role`) REFERENCES `user_role` (`roleid`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `patient user` FOREIGN KEY (`patientid`) REFERENCES `user` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient`
--

LOCK TABLES `patient` WRITE;
/*!40000 ALTER TABLE `patient` DISABLE KEYS */;
INSERT INTO `patient` VALUES ('PA0001','2005-10-12','male','pa');
/*!40000 ALTER TABLE `patient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pharmacist`
--

DROP TABLE IF EXISTS `pharmacist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pharmacist` (
  `pharmacistid` varchar(25) NOT NULL,
  `start_shift` datetime NOT NULL,
  `end_shift` datetime NOT NULL,
  `schedule` set('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
  `role` char(2) NOT NULL,
  UNIQUE KEY `userid_UNIQUE` (`pharmacistid`),
  KEY `ph role_idx` (`role`),
  CONSTRAINT `pharmacist role` FOREIGN KEY (`role`) REFERENCES `user_role` (`roleid`),
  CONSTRAINT `pharmacist user` FOREIGN KEY (`pharmacistid`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pharmacist`
--

LOCK TABLES `pharmacist` WRITE;
/*!40000 ALTER TABLE `pharmacist` DISABLE KEYS */;
INSERT INTO `pharmacist` VALUES ('PH0001','2025-09-10 09:00:00','2025-09-10 15:00:00','monday,tuesday,sunday','ph');
/*!40000 ALTER TABLE `pharmacist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pharmacy_manager`
--

DROP TABLE IF EXISTS `pharmacy_manager`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pharmacy_manager` (
  `pharmacy_managerid` varchar(25) NOT NULL,
  `employment_date` date NOT NULL,
  `approval_limit` int DEFAULT NULL,
  `years_of_experience` int NOT NULL,
  `role` char(2) NOT NULL,
  UNIQUE KEY `userid_UNIQUE` (`pharmacy_managerid`),
  KEY `pm role_idx` (`role`),
  CONSTRAINT `manager role` FOREIGN KEY (`role`) REFERENCES `user_role` (`roleid`),
  CONSTRAINT `manager user` FOREIGN KEY (`pharmacy_managerid`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pharmacy_manager`
--

LOCK TABLES `pharmacy_manager` WRITE;
/*!40000 ALTER TABLE `pharmacy_manager` DISABLE KEYS */;
INSERT INTO `pharmacy_manager` VALUES ('PM0001','2025-08-10',569,12,'pm');
/*!40000 ALTER TABLE `pharmacy_manager` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescription`
--

DROP TABLE IF EXISTS `prescription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescription` (
  `prescriptionid` varchar(255) NOT NULL,
  `doctor_id` varchar(25) NOT NULL,
  `patient_id` varchar(25) NOT NULL,
  `date_created` date NOT NULL,
  `status` enum('valid','recurring','invalid') NOT NULL,
  PRIMARY KEY (`prescriptionid`),
  UNIQUE KEY `prescriptionid_UNIQUE` (`prescriptionid`),
  KEY `doc id_idx` (`doctor_id`),
  KEY `patient id_idx` (`patient_id`),
  CONSTRAINT `doctor id` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`doctorid`),
  CONSTRAINT `patient id` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patientid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription`
--

LOCK TABLES `prescription` WRITE;
/*!40000 ALTER TABLE `prescription` DISABLE KEYS */;
INSERT INTO `prescription` VALUES ('P0001','D0001','PA0001','2025-11-17','valid');
/*!40000 ALTER TABLE `prescription` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `user_id` varchar(25) NOT NULL,
  `username` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL,
  `first_name` varchar(45) NOT NULL,
  `last_name` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `contact_number` varchar(11) DEFAULT NULL,
  `status` enum('active','inactive','deleted') NOT NULL,
  `role_id` char(2) NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `userid_UNIQUE` (`user_id`),
  KEY `roles_idx` (`role_id`),
  CONSTRAINT `roles` FOREIGN KEY (`role_id`) REFERENCES `user_role` (`roleid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('A0001','irisadmin','1r1s','Iris','Perez','iris@gmail.com',NULL,'active','a'),('D0001','joe','joe','Joe','Doc','joe@gmail.com','09694206969','active','d'),('PA0001','juan','juan','Juan','Sakitin','juansakit@gmail.com',NULL,'active','pa'),('PH0001','maria','mare','Maria','Gamot','marg@gmail.com',NULL,'active','ph'),('PM0001','coco','c0c0','Mama','Coco','rememberme@gmail.com',NULL,'active','pm');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_role`
--

DROP TABLE IF EXISTS `user_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_role` (
  `roleid` char(2) NOT NULL,
  `rolename` varchar(45) NOT NULL,
  `description` mediumtext,
  PRIMARY KEY (`roleid`),
  UNIQUE KEY `roleid_UNIQUE` (`roleid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_role`
--

LOCK TABLES `user_role` WRITE;
/*!40000 ALTER TABLE `user_role` DISABLE KEYS */;
INSERT INTO `user_role` VALUES ('a','admin','administrator of vitalsoft'),('d','doctor','users of medical fields'),('pa','patient','client/customer'),('ph','pharmacist','employee of a pharmacy branch'),('pm','pharmacy manager','manager of an assigned pharmacy branch');
/*!40000 ALTER TABLE `user_role` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-17 23:42:32
