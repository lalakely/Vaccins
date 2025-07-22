use rusqlite::{Connection, Result};

pub fn initialize_schema(conn: &Connection) -> Result<()> {
    // Create tables

    // Users table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            account_type TEXT CHECK(account_type IN ('admin', 'user', 'moderator')) DEFAULT 'user',
            status TEXT CHECK(status IN ('connecté', 'déconnecté')) DEFAULT 'déconnecté',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Logins table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS logins (
            user_id INTEGER PRIMARY KEY,
            username TEXT NOT NULL,
            ip_address TEXT NOT NULL,
            status TEXT CHECK(status IN ('connecté', 'déconnecté')) DEFAULT 'connecté',
            last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // Fokotany table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS fokotany (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            px REAL,
            py REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Hameau table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS hameau (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            px REAL NOT NULL,
            py REAL NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Vaccins table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS vaccins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            duree INTEGER,
            date_arrivee TEXT,
            date_peremption TEXT,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            duree_jours INTEGER,
            age_annees INTEGER NOT NULL DEFAULT 0,
            age_mois INTEGER NOT NULL DEFAULT 0,
            age_jours INTEGER NOT NULL DEFAULT 0,
            lot TEXT DEFAULT '',
            stock INTEGER DEFAULT 0
        )",
        [],
    )?;

    // Enfants table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS enfants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            prenom TEXT NOT NULL,
            code TEXT UNIQUE,
            date_naissance TEXT NOT NULL,
            age_premier_contact INTEGER,
            sexe TEXT CHECK(sexe IN ('M', 'F')) NOT NULL,
            nom_mere TEXT,
            nom_pere TEXT,
            domicile TEXT,
            fokotany TEXT,
            hameau TEXT,
            telephone TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // VaccinPrerequis table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS vaccin_prerequis (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vaccin_id INTEGER NOT NULL,
            prerequis_id INTEGER NOT NULL,
            strict INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (vaccin_id) REFERENCES vaccins(id) ON DELETE CASCADE,
            FOREIGN KEY (prerequis_id) REFERENCES vaccins(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // VaccinSuite table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS vaccin_suite (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vaccin_id INTEGER NOT NULL,
            suite_id INTEGER NOT NULL,
            strict INTEGER NOT NULL DEFAULT 0,
            delai INTEGER NOT NULL DEFAULT 0,
            type TEXT NOT NULL,
            description TEXT,
            FOREIGN KEY (vaccin_id) REFERENCES vaccins(id) ON DELETE CASCADE,
            FOREIGN KEY (suite_id) REFERENCES vaccins(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // Vaccinations table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS vaccinations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            enfant_id INTEGER NOT NULL,
            vaccin_id INTEGER NOT NULL,
            date_vaccination TEXT NOT NULL,
            remarque TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (enfant_id) REFERENCES enfants(id) ON DELETE CASCADE,
            FOREIGN KEY (vaccin_id) REFERENCES vaccins(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // ChildHistory table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS child_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            child_id INTEGER NOT NULL,
            action_type TEXT CHECK(action_type IN ('CREATE', 'UPDATE', 'DELETE')) NOT NULL,
            action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_id INTEGER,
            old_data TEXT,
            new_data TEXT,
            FOREIGN KEY (child_id) REFERENCES enfants(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )",
        [],
    )?;

    // DeletedChildrenLog table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS deleted_children_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            original_id INTEGER NOT NULL,
            action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_id INTEGER,
            child_data TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )",
        [],
    )?;

    // Notifications table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT CHECK(type IN ('success', 'error', 'warning', 'info')) NOT NULL DEFAULT 'info',
            category TEXT CHECK(category IN ('action_feedback', 'vaccination_alert', 'statistics', 'system', 'user_activity')) NOT NULL,
            is_read INTEGER DEFAULT 0,
            action_link TEXT,
            entity_type TEXT,
            entity_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // Create indexes for faster queries
    conn.execute("CREATE INDEX IF NOT EXISTS idx_enfants_code ON enfants(code)", [])?;
    conn.execute("CREATE INDEX IF NOT EXISTS idx_vaccinations_enfant_id ON vaccinations(enfant_id)", [])?;
    conn.execute("CREATE INDEX IF NOT EXISTS idx_vaccinations_vaccin_id ON vaccinations(vaccin_id)", [])?;
    conn.execute("CREATE INDEX IF NOT EXISTS idx_child_history_child_id ON child_history(child_id)", [])?;
    conn.execute("CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)", [])?;
    conn.execute("CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)", [])?;
    conn.execute("CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at)", [])?;
    conn.execute("CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category)", [])?;

    Ok(())
}
