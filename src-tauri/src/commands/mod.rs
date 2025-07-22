pub mod user_commands;
pub mod enfant_commands;
pub mod vaccin_commands;
pub mod vaccination_commands;
pub mod fokotany_commands;
pub mod hameau_commands;
pub mod notification_commands;

use tauri::{Runtime, AppHandle, command};
use std::path::PathBuf;
use crate::db::{initialize_db, initialize_schema, get_connection};

#[command]
pub fn init_database<R: Runtime>(app_handle: AppHandle<R>) -> Result<String, String> {
    let app_dir = app_handle.path().app_data_dir().map_err(|e| e.to_string())?;
    
    // Create the directory if it doesn't exist
    std::fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    
    // Initialize the database connection
    initialize_db(&app_dir).map_err(|e| e.to_string())?;
    
    // Initialize the schema
    let conn = get_connection().map_err(|e| e.to_string())?;
    initialize_schema(conn.as_ref().unwrap()).map_err(|e| e.to_string())?;
    
    Ok("Database initialized successfully".to_string())
}

#[command]
pub fn get_database_path<R: Runtime>(app_handle: AppHandle<R>) -> Result<PathBuf, String> {
    let app_dir = app_handle.path().app_data_dir().map_err(|e| e.to_string())?;
    let db_path = app_dir.join("csb_vaccins.db");
    
    Ok(db_path)
}
