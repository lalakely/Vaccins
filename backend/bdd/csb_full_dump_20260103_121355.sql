
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `ChildHistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ChildHistory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `child_id` int NOT NULL,
  `action_type` enum('CREATE','UPDATE','DELETE') NOT NULL,
  `action_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int DEFAULT NULL,
  `old_data` json DEFAULT NULL,
  `new_data` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_child_history_child_id` (`child_id`),
  KEY `idx_child_history_action_date` (`action_date`),
  CONSTRAINT `ChildHistory_ibfk_1` FOREIGN KEY (`child_id`) REFERENCES `Enfants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `ChildHistory` WRITE;
/*!40000 ALTER TABLE `ChildHistory` DISABLE KEYS */;
INSERT INTO `ChildHistory` (`id`, `child_id`, `action_type`, `action_date`, `user_id`, `old_data`, `new_data`) VALUES (3,43,'CREATE','2025-07-20 14:18:40',NULL,NULL,'{\"id\": 43, \"Nom\": \"RAKOTO\", \"CODE\": \"145\", \"SEXE\": \"M\", \"Hameau\": \"Ambohimena\", \"Prenom\": \"Tendry\", \"NomMere\": \"RANDRIA Rasoa\", \"NomPere\": \"RAKOTO Mamy\", \"Domicile\": \"Lot II E 57 Ambohimena\", \"Fokotany\": \"Ambohimena\", \"Telephone\": \"+261 34 56 788 65\", \"date_naissance\": \"2024-06-01\", \"age_premier_contact\": \"2\"}'),(4,44,'CREATE','2025-07-20 15:27:25',NULL,NULL,'{\"id\": 44, \"Nom\": \"RANDRIA\", \"CODE\": \"ENF125\", \"SEXE\": \"F\", \"Hameau\": \"Ambohimena\", \"Prenom\": \"Henika\", \"NomMere\": \"RANDRIA Maria\", \"NomPere\": \"RANDRIA Jean\", \"Domicile\": \"Lot II I Ambohimena\", \"Fokotany\": \"Ambohimena\", \"Telephone\": \"+261 34 56 989 56\", \"date_naissance\": \"2025-07-01\", \"age_premier_contact\": \"1\"}'),(5,44,'UPDATE','2025-07-22 18:45:50',NULL,'{\"id\": 44, \"Nom\": \"RANDRIA\", \"CODE\": \"ENF125\", \"SEXE\": \"F\", \"Hameau\": \"Ambohimena\", \"Prenom\": \"Henika\", \"NomMere\": \"RANDRIA Maria\", \"NomPere\": \"RANDRIA Jean\", \"Domicile\": \"Lot II I Ambohimena\", \"Fokotany\": \"Ambohimena\", \"Telephone\": \"+261 34 56 989 56\", \"created_at\": \"2025-07-20T15:27:25.000Z\", \"updated_at\": \"2025-07-20T15:27:25.000Z\", \"date_naissance\": \"2025-06-30T21:00:00.000Z\", \"age_premier_contact\": 1}','{\"id\": \"44\", \"Nom\": \"RANDRIA\", \"CODE\": \"ENF125\", \"SEXE\": \"F\", \"Hameau\": \"Ambohimena\", \"Prenom\": \"Henika\", \"NomMere\": \"RANDRIA Maria\", \"NomPere\": \"RANDRIA Jean\", \"Domicile\": \"Lot II I Ambohimena\", \"Fokotany\": \"Ambohimena\", \"Telephone\": \"+261 34 56 989 56\", \"created_at\": \"2025-07-20T15:27:25.000Z\", \"updated_at\": \"2025-07-20T15:27:25.000Z\", \"date_naissance\": \"2025-06-30\", \"age_premier_contact\": 1}'),(6,45,'CREATE','2026-01-02 16:14:51',NULL,NULL,'{\"id\": 45, \"Nom\": \"Randrianarivo\", \"CODE\": \"202\", \"SEXE\": \"M\", \"Hameau\": \"ESSVA\", \"Prenom\": \"Tendro\", \"NomMere\": \"Randria\", \"NomPere\": \"Randria\", \"Domicile\": \"Lot II 65 Tanambao\", \"Fokotany\": \"Antsirabe Ihany\", \"Telephone\": \"+2615849556\", \"date_naissance\": \"2026-01-01\", \"age_premier_contact\": \"2\"}'),(7,44,'UPDATE','2026-01-02 16:16:32',NULL,'{\"id\": 44, \"Nom\": \"RANDRIA\", \"CODE\": \"ENF125\", \"SEXE\": \"F\", \"Hameau\": \"Ambohimena\", \"Prenom\": \"Henika\", \"NomMere\": \"RANDRIA Maria\", \"NomPere\": \"RANDRIA Jean\", \"Domicile\": \"Lot II I Ambohimena\", \"Fokotany\": \"Ambohimena\", \"Telephone\": \"+261 34 56 989 56\", \"created_at\": \"2025-07-20T15:27:25.000Z\", \"updated_at\": \"2025-07-22T18:45:50.000Z\", \"date_naissance\": \"2025-06-29T21:00:00.000Z\", \"age_premier_contact\": 1}','{\"id\": \"44\", \"Nom\": \"RANDRIA\", \"CODE\": \"ENF125\", \"SEXE\": \"F\", \"Hameau\": \"Ambohimena\", \"Prenom\": \"Henika\", \"NomMere\": \"RANDRIA Maria\", \"NomPere\": \"RANDRIA Jean\", \"Domicile\": \"Lot II I Ambohimena\", \"Fokotany\": \"Antsirabe Ihany\", \"Telephone\": \"+261 34 56 989 56\", \"created_at\": \"2025-07-20T15:27:25.000Z\", \"updated_at\": \"2025-07-22T18:45:50.000Z\", \"date_naissance\": \"2025-06-29\", \"age_premier_contact\": 1}'),(8,46,'CREATE','2026-01-02 16:17:57',NULL,NULL,'{\"id\": 46, \"Nom\": \"RAKOTO\", \"CODE\": \"24\", \"SEXE\": \"M\", \"Hameau\": \"\", \"Prenom\": \"Herilala\", \"NomMere\": \"Harilala\", \"NomPere\": \"RAKOTO\", \"Domicile\": \"Lot II E 86 FA\", \"Fokotany\": \"Androndra\", \"Telephone\": \"+261381192316\", \"date_naissance\": \"2024-03-02\", \"age_premier_contact\": \"3\"}');
/*!40000 ALTER TABLE `ChildHistory` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `DeletedChildrenLog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DeletedChildrenLog` (
  `id` int NOT NULL AUTO_INCREMENT,
  `original_id` int NOT NULL,
  `action_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int DEFAULT NULL,
  `child_data` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_deleted_children_original_id` (`original_id`),
  KEY `idx_deleted_children_action_date` (`action_date`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `DeletedChildrenLog` WRITE;
/*!40000 ALTER TABLE `DeletedChildrenLog` DISABLE KEYS */;
INSERT INTO `DeletedChildrenLog` (`id`, `original_id`, `action_date`, `user_id`, `child_data`) VALUES (1,21,'2025-07-15 15:08:46',NULL,'{\"id\": 21, \"Nom\": \"Rakoto\", \"CODE\": \"ENF001\", \"SEXE\": \"M\", \"Hameau\": \"Ambohijanahary\", \"Prenom\": \"Jean\", \"NomMere\": \"Marie\", \"NomPere\": \"Joseph\", \"Domicile\": \"Lot 12 Ambatondrazaka\", \"Fokotany\": \"Ambatondrazaka\", \"Telephone\": \"0321234567\", \"created_at\": \"2025-07-14T15:27:21.000Z\", \"updated_at\": \"2025-07-14T15:27:21.000Z\", \"date_naissance\": \"2020-01-14T21:00:00.000Z\", \"age_premier_contact\": 5}'),(2,25,'2025-07-17 15:37:06',NULL,'{\"id\": 25, \"Nom\": \"Randria\", \"CODE\": \"ENF005\", \"SEXE\": \"M\", \"Hameau\": \"Andranomavo\", \"Prenom\": \"Paul\", \"NomMere\": \"Alice\", \"NomPere\": \"Pierre\", \"Domicile\": \"Lot 30 Mahajanga\", \"Fokotany\": \"Mahajanga\", \"Telephone\": \"0339876544\", \"created_at\": \"2025-07-14T15:27:21.000Z\", \"updated_at\": \"2025-07-14T15:27:21.000Z\", \"date_naissance\": \"2020-11-29T21:00:00.000Z\", \"age_premier_contact\": 4}'),(3,41,'2025-07-17 16:33:18',NULL,'{\"id\": 41, \"Nom\": \"Jean\", \"CODE\": \"134\", \"SEXE\": \"M\", \"Hameau\": \"Andranomavo\", \"Prenom\": \"Yves\", \"NomMere\": \"Razanadrakoto \", \"NomPere\": \"Jean\", \"Domicile\": \"Lot II E \", \"Fokotany\": \"Toamasina\", \"Telephone\": \"038 11 923 16\", \"created_at\": \"2025-07-17T15:54:37.000Z\", \"updated_at\": \"2025-07-17T15:54:37.000Z\", \"date_naissance\": \"2025-06-30T21:00:00.000Z\", \"age_premier_contact\": 2}'),(4,22,'2025-07-20 14:11:30',NULL,'{\"id\": 22, \"Nom\": \"Raso\", \"CODE\": \"ENF002\", \"SEXE\": \"F\", \"Hameau\": \"Tsararano\", \"Prenom\": \"Marie\", \"NomMere\": \"Clara\", \"NomPere\": \"Paul\", \"Domicile\": \"Lot 15 Toamasina\", \"Fokotany\": \"Toamasina\", \"Telephone\": \"0331234568\", \"created_at\": \"2025-07-14T15:27:21.000Z\", \"updated_at\": \"2025-07-14T15:27:21.000Z\", \"date_naissance\": \"2021-03-21T21:00:00.000Z\", \"age_premier_contact\": 4}'),(5,23,'2025-07-20 14:11:34',NULL,'{\"id\": 23, \"Nom\": \"Rabe\", \"CODE\": \"ENF003\", \"SEXE\": \"M\", \"Hameau\": \"Ankazobe\", \"Prenom\": \"Luc\", \"NomMere\": \"Sophie\", \"NomPere\": \"Antoine\", \"Domicile\": \"Lot 20 Antananarivo\", \"Fokotany\": \"Antananarivo\", \"Telephone\": \"0341234569\", \"created_at\": \"2025-07-14T15:27:21.000Z\", \"updated_at\": \"2025-07-14T15:27:21.000Z\", \"date_naissance\": \"2019-07-09T21:00:00.000Z\", \"age_premier_contact\": 6}'),(6,24,'2025-07-20 14:11:37',NULL,'{\"id\": 24, \"Nom\": \"Ranaivo\", \"CODE\": \"ENF004\", \"SEXE\": \"F\", \"Hameau\": \"Manandriana\", \"Prenom\": \"Clara\", \"NomMere\": \"Jeanne\", \"NomPere\": \"Michel\", \"Domicile\": \"Lot 25 Fianarantsoa\", \"Fokotany\": \"Fianarantsoa\", \"Telephone\": \"0329876543\", \"created_at\": \"2025-07-14T15:27:21.000Z\", \"updated_at\": \"2025-07-14T15:27:21.000Z\", \"date_naissance\": \"2022-05-04T21:00:00.000Z\", \"age_premier_contact\": 3}'),(7,27,'2025-07-20 14:11:39',NULL,'{\"id\": 27, \"Nom\": \"Rakotomalala\", \"CODE\": \"ENF007\", \"SEXE\": \"M\", \"Hameau\": \"Tsararano\", \"Prenom\": \"Antoine\", \"NomMere\": \"Emma\", \"NomPere\": \"David\", \"Domicile\": \"Lot 40 Toamasina\", \"Fokotany\": \"Toamasina\", \"Telephone\": \"0326543210\", \"created_at\": \"2025-07-14T15:27:21.000Z\", \"updated_at\": \"2025-07-14T15:27:21.000Z\", \"date_naissance\": \"2019-12-24T21:00:00.000Z\", \"age_premier_contact\": 5}'),(8,26,'2025-07-20 14:11:42',NULL,'{\"id\": 26, \"Nom\": \"Rasoa\", \"CODE\": \"ENF006\", \"SEXE\": \"F\", \"Hameau\": \"Ambohijanahary\", \"Prenom\": \"Sophie\", \"NomMere\": \"Louise\", \"NomPere\": \"Jacques\", \"Domicile\": \"Lot 35 Ambatondrazaka\", \"Fokotany\": \"Ambatondrazaka\", \"Telephone\": \"0349876545\", \"created_at\": \"2025-07-14T15:27:21.000Z\", \"updated_at\": \"2025-07-14T15:27:21.000Z\", \"date_naissance\": \"2021-09-11T21:00:00.000Z\", \"age_premier_contact\": 3}'),(9,28,'2025-07-20 14:11:45',NULL,'{\"id\": 28, \"Nom\": \"Raharisoa\", \"CODE\": \"ENF008\", \"SEXE\": \"F\", \"Hameau\": \"Ankazobe\", \"Prenom\": \"Jeanne\", \"NomMere\": \"Rose\", \"NomPere\": \"Daniel\", \"Domicile\": \"Lot 45 Antananarivo\", \"Fokotany\": \"Antananarivo\", \"Telephone\": \"0336543211\", \"created_at\": \"2025-07-14T15:27:21.000Z\", \"updated_at\": \"2025-07-14T15:27:21.000Z\", \"date_naissance\": \"2022-02-13T21:00:00.000Z\", \"age_premier_contact\": 3}'),(10,29,'2025-07-20 14:11:47',NULL,'{\"id\": 29, \"Nom\": \"Rajoelina\", \"CODE\": \"ENF009\", \"SEXE\": \"M\", \"Hameau\": \"Manandriana\", \"Prenom\": \"Michel\", \"NomMere\": \"Laura\", \"NomPere\": \"Thomas\", \"Domicile\": \"Lot 50 Fianarantsoa\", \"Fokotany\": \"Fianarantsoa\", \"Telephone\": \"0346543212\", \"created_at\": \"2025-07-14T15:27:21.000Z\", \"updated_at\": \"2025-07-14T15:27:21.000Z\", \"date_naissance\": \"2020-04-17T21:00:00.000Z\", \"age_premier_contact\": 5}'),(11,30,'2025-07-20 14:11:50',NULL,'{\"id\": 30, \"Nom\": \"Ramanantsoa\", \"CODE\": \"ENF010\", \"SEXE\": \"F\", \"Hameau\": \"Andranomavo\", \"Prenom\": \"Alice\", \"NomMere\": \"Julie\", \"NomPere\": \"Marc\", \"Domicile\": \"Lot 55 Mahajanga\", \"Fokotany\": \"Mahajanga\", \"Telephone\": \"0323219876\", \"created_at\": \"2025-07-14T15:27:21.000Z\", \"updated_at\": \"2025-07-14T15:27:21.000Z\", \"date_naissance\": \"2021-06-19T21:00:00.000Z\", \"age_premier_contact\": 4}'),(12,31,'2025-07-20 14:11:52',NULL,'{\"id\": 31, \"Nom\": \"Rakotondraja\", \"CODE\": \"ENF011\", \"SEXE\": \"M\", \"Hameau\": \"Ambohijanahary\", \"Prenom\": \"Pierre\", \"NomMere\": \"Chloe\", \"NomPere\": \"Lucas\", \"Domicile\": \"Lot 60 Ambatondrazaka\", \"Fokotany\": \"Ambatondrazaka\", \"Telephone\": \"0333219877\", \"created_at\": \"2025-07-14T15:27:21.000Z\", \"updated_at\": \"2025-07-14T15:27:21.000Z\", \"date_naissance\": \"2019-08-29T21:00:00.000Z\", \"age_premier_contact\": 6}'),(13,32,'2025-07-20 14:11:54',NULL,'{\"id\": 32, \"Nom\": \"Rasolofoson\", \"CODE\": \"ENF012\", \"SEXE\": \"F\", \"Hameau\": \"Tsararano\", \"Prenom\": \"Louise\", \"NomMere\": \"Anna\", \"NomPere\": \"Simon\", \"Domicile\": \"Lot 65 Toamasina\", \"Fokotany\": \"Toamasina\", \"Telephone\": \"0343219878\", \"created_at\": \"2025-07-14T15:27:21.000Z\", \"updated_at\": \"2025-07-14T15:27:21.000Z\", \"date_naissance\": \"2022-07-06T21:00:00.000Z\", \"age_premier_contact\": 3}'),(14,33,'2025-07-20 14:11:58',NULL,'{\"id\": 33, \"Nom\": \"Rabearisoa\", \"CODE\": \"ENF013\", \"SEXE\": \"M\", \"Hameau\": \"Ankazobe\", \"Prenom\": \"Jacques\", \"NomMere\": \"Lisa\", \"NomPere\": \"Olivier\", \"Domicile\": \"Lot 70 Antananarivo\", \"Fokotany\": \"Antananarivo\", \"Telephone\": \"0327896543\", \"created_at\": \"2025-07-14T15:27:21.000Z\", \"updated_at\": \"2025-07-14T15:27:21.000Z\", \"date_naissance\": \"2020-10-09T21:00:00.000Z\", \"age_premier_contact\": 4}'),(15,34,'2025-07-20 14:12:00',NULL,'{\"id\": 34, \"Nom\": \"Rakotobe\", \"CODE\": \"ENF014\", \"SEXE\": \"F\", \"Hameau\": \"Manandriana\", \"Prenom\": \"Emma\", \"NomMere\": \"Sarah\", \"NomPere\": \"Vincent\", \"Domicile\": \"Lot 75 Fianarantsoa\", \"Fokotany\": \"Fianarantsoa\", \"Telephone\": \"0337896544\", \"created_at\": \"2025-07-14T15:27:21.000Z\", \"updated_at\": \"2025-07-14T15:27:21.000Z\", \"date_naissance\": \"2021-01-24T21:00:00.000Z\", \"age_premier_contact\": 4}'),(16,36,'2025-07-20 14:12:02',NULL,'{\"id\": 36, \"Nom\": \"Rasamimanana\", \"CODE\": \"ENF016\", \"SEXE\": \"F\", \"Hameau\": \"Ambohijanahary\", \"Prenom\": \"Rose\", \"NomMere\": \"Lea\", \"NomPere\": \"Bruno\", \"Domicile\": \"Lot 85 Ambatondrazaka\", \"Fokotany\": \"Ambatondrazaka\", \"Telephone\": \"0324561234\", \"created_at\": \"2025-07-14T15:27:21.000Z\", \"updated_at\": \"2025-07-14T15:27:21.000Z\", \"date_naissance\": \"2022-04-11T21:00:00.000Z\", \"age_premier_contact\": 3}'),(17,35,'2025-07-20 14:12:04',NULL,'{\"id\": 35, \"Nom\": \"Randriamanana\", \"CODE\": \"ENF015\", \"SEXE\": \"M\", \"Hameau\": \"Andranomavo\", \"Prenom\": \"David\", \"NomMere\": \"Nina\", \"NomPere\": \"Julien\", \"Domicile\": \"Lot 80 Mahajanga\", \"Fokotany\": \"Mahajanga\", \"Telephone\": \"0347896545\", \"created_at\": \"2025-07-14T15:27:21.000Z\", \"updated_at\": \"2025-07-14T15:27:21.000Z\", \"date_naissance\": \"2019-03-14T21:00:00.000Z\", \"age_premier_contact\": 6}'),(18,37,'2025-07-20 14:12:06',NULL,'{\"id\": 37, \"Nom\": \"Rakotonirina\", \"CODE\": \"ENF017\", \"SEXE\": \"M\", \"Hameau\": \"Tsararano\", \"Prenom\": \"Daniel\", \"NomMere\": \"Zoe\", \"NomPere\": \"Eric\", \"Domicile\": \"Lot 90 Toamasina\", \"Fokotany\": \"Toamasina\", \"Telephone\": \"0334561235\", \"created_at\": \"2025-07-14T15:27:21.000Z\", \"updated_at\": \"2025-07-14T15:27:21.000Z\", \"date_naissance\": \"2020-06-04T21:00:00.000Z\", \"age_premier_contact\": 5}'),(19,38,'2025-07-20 14:12:09',NULL,'{\"id\": 38, \"Nom\": \"Rasoarimalala\", \"CODE\": \"ENF018\", \"SEXE\": \"F\", \"Hameau\": \"Ankazobe\", \"Prenom\": \"Laura\", \"NomMere\": \"Mia\", \"NomPere\": \"Remy\", \"Domicile\": \"Lot 95 Antananarivo\", \"Fokotany\": \"Antananarivo\", \"Telephone\": \"0344561236\", \"created_at\": \"2025-07-14T15:27:21.000Z\", \"updated_at\": \"2025-07-14T15:27:21.000Z\", \"date_naissance\": \"2021-08-17T21:00:00.000Z\", \"age_premier_contact\": 4}'),(20,39,'2025-07-20 14:12:11',NULL,'{\"id\": 39, \"Nom\": \"Rakotomalala\", \"CODE\": \"ENF019\", \"SEXE\": \"M\", \"Hameau\": \"Manandriana\", \"Prenom\": \"Thomas\", \"NomMere\": \"Elisa\", \"NomPere\": \"Gilles\", \"Domicile\": \"Lot 100 Fianarantsoa\", \"Fokotany\": \"Fianarantsoa\", \"Telephone\": \"0321237890\", \"created_at\": \"2025-07-14T15:27:21.000Z\", \"updated_at\": \"2025-07-14T15:27:21.000Z\", \"date_naissance\": \"2019-11-21T21:00:00.000Z\", \"age_premier_contact\": 5}'),(21,40,'2025-07-20 14:12:14',NULL,'{\"id\": 40, \"Nom\": \"Randrianasolo\", \"CODE\": \"ENF020\", \"SEXE\": \"F\", \"Hameau\": \"Andranomavo\", \"Prenom\": \"Julie\", \"NomMere\": \"Adele\", \"NomPere\": \"Franck\", \"Domicile\": \"Lot 105 Mahajanga\", \"Fokotany\": \"Mahajanga\", \"Telephone\": \"0331237891\", \"created_at\": \"2025-07-14T15:27:21.000Z\", \"updated_at\": \"2025-07-14T15:27:21.000Z\", \"date_naissance\": \"2022-09-29T21:00:00.000Z\", \"age_premier_contact\": 2}');
/*!40000 ALTER TABLE `DeletedChildrenLog` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `Enfants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Enfants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `Nom` varchar(100) NOT NULL,
  `Prenom` varchar(100) NOT NULL,
  `CODE` varchar(50) DEFAULT NULL,
  `date_naissance` date NOT NULL,
  `age_premier_contact` int DEFAULT NULL,
  `SEXE` enum('M','F') NOT NULL,
  `NomMere` varchar(100) DEFAULT NULL,
  `NomPere` varchar(100) DEFAULT NULL,
  `Domicile` varchar(255) DEFAULT NULL,
  `Fokotany` varchar(100) DEFAULT NULL,
  `Hameau` varchar(100) DEFAULT NULL,
  `Telephone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CODE` (`CODE`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `Enfants` WRITE;
/*!40000 ALTER TABLE `Enfants` DISABLE KEYS */;
INSERT INTO `Enfants` (`id`, `Nom`, `Prenom`, `CODE`, `date_naissance`, `age_premier_contact`, `SEXE`, `NomMere`, `NomPere`, `Domicile`, `Fokotany`, `Hameau`, `Telephone`, `created_at`, `updated_at`) VALUES (43,'RAKOTO','Tendry','145','2024-06-01',2,'M','RANDRIA Rasoa','RAKOTO Mamy','Lot II E 57 Ambohimena','Ambohimena','Ambohimena','+261 34 56 788 65','2025-07-20 14:18:40','2025-07-20 14:18:40'),(44,'RANDRIA','Henika','ENF125','2025-06-29',1,'F','RANDRIA Maria','RANDRIA Jean','Lot II I Ambohimena','Antsirabe Ihany','Ambohimena','+261 34 56 989 56','2025-07-20 15:27:25','2026-01-02 16:16:32'),(45,'Randrianarivo','Tendro','202','2026-01-01',2,'M','Randria','Randria','Lot II 65 Tanambao','Antsirabe Ihany','ESSVA','+2615849556','2026-01-02 16:14:51','2026-01-02 16:14:51'),(46,'RAKOTO','Herilala','24','2024-03-02',3,'M','Harilala','RAKOTO','Lot II E 86 FA','Androndra','','+261381192316','2026-01-02 16:17:57','2026-01-02 16:17:57');
/*!40000 ALTER TABLE `Enfants` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `Fokotany`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Fokotany` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Nom` varchar(100) NOT NULL,
  `px` decimal(10,6) DEFAULT NULL,
  `py` decimal(10,6) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `Fokotany` WRITE;
/*!40000 ALTER TABLE `Fokotany` DISABLE KEYS */;
INSERT INTO `Fokotany` (`ID`, `Nom`, `px`, `py`, `created_at`, `updated_at`) VALUES (14,'Ambohimena',47.040281,-19.893084,'2025-07-20 14:13:04','2025-07-20 14:13:04'),(15,'Antsirabe Ihany',47.036505,-19.846023,'2026-01-02 15:56:07','2026-01-02 16:07:00'),(16,'Betsiboka',47.263184,-16.751948,'2026-01-02 15:56:45','2026-01-02 15:56:45'),(17,'Androndra',47.564921,-18.743571,'2026-01-02 16:00:07','2026-01-02 16:00:07');
/*!40000 ALTER TABLE `Fokotany` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `Hameau`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Hameau` (
  `id` int NOT NULL AUTO_INCREMENT,
  `Nom` varchar(100) NOT NULL,
  `px` double NOT NULL,
  `py` double NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `Hameau` WRITE;
/*!40000 ALTER TABLE `Hameau` DISABLE KEYS */;
INSERT INTO `Hameau` (`id`, `Nom`, `px`, `py`, `created_at`, `updated_at`) VALUES (12,'Ambohimena',47.039745,-19.893704,'2025-07-20 14:14:26','2025-07-20 14:14:26'),(13,'ESSVA',47.035394,-19.840425,'2026-01-02 15:54:24','2026-01-02 15:54:24');
/*!40000 ALTER TABLE `Hameau` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `VaccinPrerequis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `VaccinPrerequis` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vaccin_id` int NOT NULL,
  `prerequis_id` int NOT NULL,
  `strict` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `vaccin_id` (`vaccin_id`),
  KEY `prerequis_id` (`prerequis_id`),
  CONSTRAINT `VaccinPrerequis_ibfk_1` FOREIGN KEY (`vaccin_id`) REFERENCES `Vaccins` (`id`) ON DELETE CASCADE,
  CONSTRAINT `VaccinPrerequis_ibfk_2` FOREIGN KEY (`prerequis_id`) REFERENCES `Vaccins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `VaccinPrerequis` WRITE;
/*!40000 ALTER TABLE `VaccinPrerequis` DISABLE KEYS */;
/*!40000 ALTER TABLE `VaccinPrerequis` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `VaccinSuite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `VaccinSuite` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vaccin_id` int NOT NULL,
  `suite_id` int NOT NULL,
  `strict` tinyint(1) NOT NULL DEFAULT '0',
  `delai` int NOT NULL DEFAULT '0',
  `type` varchar(20) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `vaccin_id` (`vaccin_id`),
  KEY `suite_id` (`suite_id`),
  CONSTRAINT `VaccinSuite_ibfk_1` FOREIGN KEY (`vaccin_id`) REFERENCES `Vaccins` (`id`) ON DELETE CASCADE,
  CONSTRAINT `VaccinSuite_ibfk_2` FOREIGN KEY (`suite_id`) REFERENCES `Vaccins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `VaccinSuite` WRITE;
/*!40000 ALTER TABLE `VaccinSuite` DISABLE KEYS */;
INSERT INTO `VaccinSuite` (`id`, `vaccin_id`, `suite_id`, `strict`, `delai`, `type`, `description`) VALUES (24,26,26,1,30,'s',NULL),(25,26,26,1,30,'r',NULL);
/*!40000 ALTER TABLE `VaccinSuite` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `Vaccinations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Vaccinations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `enfant_id` int NOT NULL,
  `vaccin_id` int NOT NULL,
  `date_vaccination` date NOT NULL,
  `remarque` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `enfant_id` (`enfant_id`),
  KEY `vaccin_id` (`vaccin_id`),
  CONSTRAINT `Vaccinations_ibfk_1` FOREIGN KEY (`enfant_id`) REFERENCES `Enfants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Vaccinations_ibfk_2` FOREIGN KEY (`vaccin_id`) REFERENCES `Vaccins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `Vaccinations` WRITE;
/*!40000 ALTER TABLE `Vaccinations` DISABLE KEYS */;
INSERT INTO `Vaccinations` (`id`, `enfant_id`, `vaccin_id`, `date_vaccination`, `remarque`, `created_at`, `updated_at`) VALUES (52,43,26,'2026-01-02',NULL,'2026-01-02 16:08:53','2026-01-02 16:08:53'),(54,43,26,'2026-01-02','Rappel du vaccin 26 (vaccination #52)','2026-01-02 16:09:41','2026-01-02 16:09:41'),(55,44,26,'2026-01-02',NULL,'2026-01-02 16:15:18','2026-01-02 16:15:18'),(56,46,26,'2026-01-02',NULL,'2026-01-02 16:53:08','2026-01-02 16:53:08');
/*!40000 ALTER TABLE `Vaccinations` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `Vaccins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Vaccins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `Nom` varchar(100) NOT NULL,
  `Duree` int DEFAULT NULL,
  `Date_arrivee` date DEFAULT NULL,
  `Date_peremption` date DEFAULT NULL,
  `Description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `Duree_Jours` int DEFAULT NULL,
  `Age_Annees` int NOT NULL DEFAULT '0',
  `Age_Mois` int NOT NULL DEFAULT '0',
  `Age_Jours` int NOT NULL DEFAULT '0',
  `Lot` varchar(255) DEFAULT '',
  `Stock` int DEFAULT '0',
  PRIMARY KEY (`id`),
  CONSTRAINT `check_stock_non_negative` CHECK ((`Stock` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `Vaccins` WRITE;
/*!40000 ALTER TABLE `Vaccins` DISABLE KEYS */;
INSERT INTO `Vaccins` (`id`, `Nom`, `Duree`, `Date_arrivee`, `Date_peremption`, `Description`, `created_at`, `updated_at`, `Duree_Jours`, `Age_Annees`, `Age_Mois`, `Age_Jours`, `Lot`, `Stock`) VALUES (26,'test',12,'2025-12-31','2026-01-09','Ce vaccin est un vaccin pas comme les autres','2026-01-02 15:59:33','2026-01-02 16:53:09',NULL,3,0,0,'12',3);
/*!40000 ALTER TABLE `Vaccins` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `logins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logins` (
  `user_id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `status` enum('connecté','déconnecté') DEFAULT 'connecté',
  `last_login` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `logins_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `logins` WRITE;
/*!40000 ALTER TABLE `logins` DISABLE KEYS */;
INSERT INTO `logins` (`user_id`, `username`, `ip_address`, `status`, `last_login`) VALUES (1,'hrakoto','127.0.0.1','déconnecté','2025-08-20 13:34:59'),(2,'herilala','192.168.178.123','déconnecté','2025-07-20 15:23:04'),(3,'ben','127.0.0.1','déconnecté','2025-07-20 14:22:50'),(5,'admin','10.212.20.126','connecté','2026-01-03 08:16:23');
/*!40000 ALTER TABLE `logins` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `title` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `type` enum('success','error','warning','info') NOT NULL DEFAULT 'info',
  `category` enum('action_feedback','vaccination_alert','statistics','system','user_activity') NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `action_link` varchar(255) DEFAULT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user_id` (`user_id`),
  KEY `idx_notifications_is_read` (`is_read`),
  KEY `idx_notifications_created_at` (`created_at`),
  KEY `idx_notifications_category` (`category`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=135942 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `category`, `is_read`, `action_link`, `entity_type`, `entity_id`, `created_at`, `expires_at`) VALUES (135936,5,'Données chargées','2 hameaux ont été chargés','info','system',0,NULL,NULL,NULL,'2026-01-03 08:19:49','2026-01-03 02:19:59'),(135937,5,'Alerte de vaccination','2 hameaux ont une couverture vaccinale inférieure à 50%','error','action_feedback',0,'/Hameau',NULL,NULL,'2026-01-03 08:19:49','2026-01-03 02:19:59'),(135938,5,'Données chargées','2 hameaux ont été chargés','info','system',0,NULL,NULL,NULL,'2026-01-03 08:20:23','2026-01-03 02:20:33'),(135939,5,'Alerte de vaccination','2 hameaux ont une couverture vaccinale inférieure à 50%','error','action_feedback',0,'/Hameau',NULL,NULL,'2026-01-03 08:20:23','2026-01-03 02:20:33'),(135940,5,'Erreur de chargement','Impossible de charger la liste des hameaux. Mode hors ligne activé.','error','action_feedback',0,NULL,NULL,NULL,'2026-01-03 08:27:25','2026-01-03 02:27:35'),(135941,5,'Erreur de chargement','Impossible de charger la liste des hameaux. Mode hors ligne activé.','error','action_feedback',0,NULL,NULL,NULL,'2026-01-03 08:32:15','2026-01-03 02:32:25');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `account_type` enum('admin','user','moderator') DEFAULT 'user',
  `status` enum('connecté','déconnecté') DEFAULT 'déconnecté',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`, `username`, `password_hash`, `account_type`, `status`, `created_at`, `updated_at`) VALUES (1,'hrakoto','$2a$10$BjtiFLSjbEtqPFyQGtnldee3/ET7rtks/dxS6q/WpFF8jQmB6Ocb2','admin','déconnecté','2025-07-14 15:14:26','2025-08-20 13:34:59'),(2,'herilala','$2a$10$mdc065Ai7Z2t8.I0FuLM4eiY/Va5xZm8oetYGmDmS1bsVkn.wKI.m','admin','déconnecté','2025-07-20 14:06:02','2025-07-20 15:23:04'),(3,'ben','$2a$10$cMyv2f2FnStDhBK6NignsuLUzyK7sNE2bdOXG9s4IhGb65VklCNqu','admin','déconnecté','2025-07-20 14:09:54','2025-07-20 14:22:50'),(5,'admin','$2a$10$hIe2AMzK7QhRLnICgHxMX.tDj4.2NdgnVeaMEUJqTSHGgDWcG6JvG','user','connecté','2026-01-02 15:53:02','2026-01-02 15:53:31');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!50106 SET @save_time_zone= @@TIME_ZONE */ ;
/*!50106 DROP EVENT IF EXISTS `clean_expired_notifications` */;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8mb4 */ ;;
/*!50003 SET character_set_results = utf8mb4 */ ;;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`root`@`localhost`*/ /*!50106 EVENT `clean_expired_notifications` ON SCHEDULE EVERY 1 DAY STARTS '2025-07-14 20:42:56' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN
    CALL delete_expired_notifications();
END */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
DELIMITER ;
/*!50106 SET TIME_ZONE= @save_time_zone */ ;
/*!50003 DROP PROCEDURE IF EXISTS `create_notification` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `create_notification`(
    IN p_user_id INT,
    IN p_title VARCHAR(100),
    IN p_message TEXT,
    IN p_type ENUM('success', 'error', 'warning', 'info'),
    IN p_category ENUM('action_feedback', 'vaccination_alert', 'statistics', 'system', 'user_activity'),
    IN p_action_link VARCHAR(255),
    IN p_entity_type VARCHAR(50),
    IN p_entity_id INT,
    IN p_expires_at TIMESTAMP
)
BEGIN
    INSERT INTO notifications (
        user_id, title, message, type, category, 
        action_link, entity_type, entity_id, expires_at
    ) VALUES (
        p_user_id, p_title, p_message, p_type, p_category, 
        p_action_link, p_entity_type, p_entity_id, p_expires_at
    );
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `delete_expired_notifications` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `delete_expired_notifications`()
BEGIN
    DELETE FROM notifications WHERE expires_at IS NOT NULL AND expires_at < NOW();
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `mark_all_notifications_as_read` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `mark_all_notifications_as_read`(
    IN p_user_id INT
)
BEGIN
    UPDATE notifications SET is_read = TRUE WHERE user_id = p_user_id OR user_id IS NULL;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `mark_notification_as_read` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `mark_notification_as_read`(
    IN p_notification_id INT
)
BEGIN
    UPDATE notifications SET is_read = TRUE WHERE id = p_notification_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

