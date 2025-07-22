// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;

use tauri::{App, AppHandle, Manager, State};
use std::sync::{Arc, Mutex};
use std::path::PathBuf;
use log::{info, error};

// Structure qui contiendra l'état de l'application
struct AppState {
    db_initialized: Arc<Mutex<bool>>,
}

// Fonction d'initialisation de la base de données
fn setup_database(app: &App) -> Result<(), String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    
    // Créer le répertoire s'il n'existe pas
    std::fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    
    info!("Initialisation de la base de données SQLite dans {:?}", app_dir);
    
    // Initialiser la connexion à la base de données
    db::initialize_db(&app_dir).map_err(|e| {
        error!("Erreur lors de l'initialisation de la connexion: {}", e);
        e.to_string()
    })?;
    
    // Récupérer la connexion et initialiser le schéma
    let conn = db::get_connection().map_err(|e| e.to_string())?;
    db::initialize_schema(conn.as_ref().unwrap()).map_err(|e| {
        error!("Erreur lors de l'initialisation du schéma: {}", e);
        e.to_string()
    })?;
    
    info!("Base de données SQLite initialisée avec succès");
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .manage(AppState {
            db_initialized: Arc::new(Mutex::new(false)),
        })
        .setup(|app| {
            // Initialiser la base de données au démarrage de l'application
            match setup_database(app) {
                Ok(_) => {
                    // Marquer la base de données comme initialisée
                    let state: State<AppState> = app.state();
                    let mut initialized = state.db_initialized.lock().unwrap();
                    *initialized = true;
                    info!("Initialisation de la base de données terminée");
                }
                Err(e) => {
                    error!("Échec de l'initialisation de la base de données: {}", e);
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Erreur lors du démarrage de l'application Tauri");
}
