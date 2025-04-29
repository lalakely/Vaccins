USE csb;

CREATE TABLE IF NOT EXISTS logins (
    user_id INT NOT NULL,
    username VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    status ENUM('connecté', 'déconnecté') DEFAULT 'connecté',
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
