use std::path::Path;
use std::sync::Mutex;
use rusqlite::{Connection, Result};
use once_cell::sync::Lazy;
use anyhow::Context;

pub static DB_CONNECTION: Lazy<Mutex<Option<Connection>>> = Lazy::new(|| {
    Mutex::new(None)
});

pub fn initialize_db(app_dir: &Path) -> Result<(), anyhow::Error> {
    let db_path = app_dir.join("csb.db");
    let conn = Connection::open(&db_path)
        .with_context(|| format!("Failed to open database at {:?}", db_path))?;
    
    // Enable foreign keys
    conn.execute("PRAGMA foreign_keys = ON", [])?;
    
    // Store the connection
    let mut db_conn = DB_CONNECTION.lock().unwrap();
    *db_conn = Some(conn);
    
    Ok(())
}

pub fn get_connection() -> Result<std::sync::MutexGuard<Option<Connection>>, anyhow::Error> {
    let conn = DB_CONNECTION.lock()
        .map_err(|e| anyhow::anyhow!("Failed to acquire database lock: {}", e))?;
    
    if conn.is_none() {
        return Err(anyhow::anyhow!("Database not initialized"));
    }
    
    Ok(conn)
}
