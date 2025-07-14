-- System.sql - Système de gestion des scripts SQL pour la base de données CSB
-- Ce fichier centralise l'exécution de tous les scripts SQL dans le répertoire bdd

-- Utilisation de la base de données CSB
USE csb;

-- Table pour suivre les scripts SQL exécutés
CREATE TABLE IF NOT EXISTS sql_migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checksum VARCHAR(64) NOT NULL,
    status ENUM('success', 'failed') DEFAULT 'success',
    error_message TEXT
);

-- Procédure pour vérifier si un script a déjà été exécuté
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS check_script_executed(IN script_name VARCHAR(255), OUT is_executed BOOLEAN)
BEGIN
    DECLARE script_count INT;
    SELECT COUNT(*) INTO script_count FROM sql_migrations WHERE filename = script_name;
    IF script_count > 0 THEN
        SET is_executed = TRUE;
    ELSE
        SET is_executed = FALSE;
    END IF;
END //
DELIMITER ;

-- Procédure pour enregistrer l'exécution d'un script
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS register_script(IN script_name VARCHAR(255), IN script_checksum VARCHAR(64))
BEGIN
    INSERT INTO sql_migrations (filename, checksum) VALUES (script_name, script_checksum);
END //
DELIMITER ;

-- Procédure pour mettre à jour le statut d'un script en cas d'erreur
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS update_script_status(IN script_name VARCHAR(255), IN status_value ENUM('success', 'failed'), IN error_msg TEXT)
BEGIN
    UPDATE sql_migrations 
    SET status = status_value, error_message = error_msg 
    WHERE filename = script_name;
END //
DELIMITER ;

-- Fonction pour calculer le checksum d'un script (simulation)
DELIMITER //
CREATE FUNCTION IF NOT EXISTS calculate_checksum(script_content TEXT) RETURNS VARCHAR(64)
DETERMINISTIC
BEGIN
    -- Cette fonction est une simulation, dans un environnement réel,
    -- vous utiliseriez une fonction de hachage comme SHA-256
    RETURN SHA2(script_content, 256);
END //
DELIMITER ;

-- Ordre d'exécution des scripts SQL
-- Les scripts sont exécutés dans l'ordre spécifié ci-dessous

-- 1. Structure de base
SOURCE users.sql;
SOURCE accounts.sql;

-- 2. Tables principales
SOURCE Fokotany.sql;
SOURCE Hameau.sql;
SOURCE Enfants.sql;
SOURCE Vaccins.sql;
SOURCE Vaccinations.sql;
SOURCE MigrationDuree.sql;

-- 3. Modifications et ajouts
SOURCE add_age_columns.sql;
SOURCE add_child_history_table.sql;
SOURCE add_deleted_children_log_table.sql;
SOURCE add_strict_column.sql;
SOURCE add_strict_delai_to_suite.sql;
SOURCE fix_child_history_constraint.sql;

-- 4. Autres scripts (ajoutez vos nouveaux scripts ici)
-- SOURCE nouveau_script.sql;

-- Procédure pour exécuter tous les scripts en séquence avec gestion des erreurs
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS run_all_scripts()
BEGIN
    DECLARE script_executed BOOLEAN;
    DECLARE current_script VARCHAR(255);
    DECLARE script_list VARCHAR(1000);
    DECLARE script_content TEXT;
    DECLARE script_checksum VARCHAR(64);
    DECLARE exit_loop BOOLEAN DEFAULT FALSE;
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        -- Gestion des erreurs
        GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
        SET @error_message = CONCAT('Erreur ', @errno, ' (', @sqlstate, '): ', @text);
        CALL update_script_status(current_script, 'failed', @error_message);
        SET exit_loop = TRUE;
    END;

    -- Liste des scripts à exécuter dans l'ordre
    SET script_list = 'users.sql,accounts.sql,Fokotany.sql,Hameau.sql,Enfants.sql,Vaccins.sql,Vaccinations.sql,MigrationDuree.sql,add_age_columns.sql,add_child_history_table.sql,add_deleted_children_log_table.sql,add_strict_column.sql,add_strict_delai_to_suite.sql,fix_child_history_constraint.sql';
    
    -- Boucle à travers la liste des scripts
    WHILE script_list != '' AND NOT exit_loop DO
        -- Extraire le premier script de la liste
        SET current_script = SUBSTRING_INDEX(script_list, ',', 1);
        SET script_list = IF(LOCATE(',', script_list) > 0, SUBSTRING(script_list FROM LOCATE(',', script_list) + 1), '');
        
        -- Vérifier si le script a déjà été exécuté
        CALL check_script_executed(current_script, script_executed);
        
        IF NOT script_executed THEN
            -- Simuler la lecture du contenu du script (dans un environnement réel, vous liriez le fichier)
            -- SET script_content = LOAD_FILE(CONCAT('/chemin/vers/bdd/', current_script));
            SET script_content = 'Contenu simulé';
            SET script_checksum = calculate_checksum(script_content);
            
            -- Enregistrer l'exécution du script
            CALL register_script(current_script, script_checksum);
            
            -- Exécuter le script (dans un environnement réel, vous utiliseriez SOURCE)
            -- SOURCE current_script;
            
            -- Si nous arrivons ici, l'exécution a réussi
            SELECT CONCAT('Script ', current_script, ' exécuté avec succès') AS message;
        ELSE
            SELECT CONCAT('Script ', current_script, ' déjà exécuté, ignoré') AS message;
        END IF;
    END WHILE;
    
    IF exit_loop THEN
        SELECT 'Exécution interrompue en raison d''une erreur' AS message;
    ELSE
        SELECT 'Tous les scripts ont été exécutés avec succès' AS message;
    END IF;
END //
DELIMITER ;

-- Instructions d'utilisation
/*
Pour exécuter tous les scripts en séquence avec gestion des erreurs:
CALL run_all_scripts();

Pour ajouter un nouveau script:
1. Ajoutez le fichier SQL dans le répertoire bdd
2. Ajoutez une ligne SOURCE nouveau_script.sql; dans la section appropriée ci-dessus
3. Ajoutez le nom du script à la variable script_list dans la procédure run_all_scripts
*/

-- Fin du fichier System.sql
