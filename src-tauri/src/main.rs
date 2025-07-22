// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
mod commands;

use commands::{init_database, get_database_path};
use commands::user_commands::*;
use commands::enfant_commands::*;
use commands::vaccin_commands::*;
use commands::vaccination_commands::*;
use commands::fokotany_commands::*;
use commands::hameau_commands::*;
use commands::notification_commands::*;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            // Database initialization
            init_database,
            get_database_path,
            
            // User commands
            user_register,
            user_login,
            user_logout,
            user_get_by_id,
            user_get_by_username,
            user_update,
            user_delete,
            user_get_all,
            
            // Enfant commands
            enfant_create,
            enfant_get_by_id,
            enfant_get_by_code,
            enfant_update,
            enfant_delete,
            enfant_get_all,
            
            // Vaccin commands
            vaccin_create,
            vaccin_get_by_id,
            vaccin_update,
            vaccin_delete,
            vaccin_get_all,
            vaccin_add_prerequis,
            vaccin_get_prerequis,
            vaccin_delete_prerequis,
            vaccin_add_suite,
            vaccin_get_suites,
            vaccin_delete_suite,
            
            // Vaccination commands
            vaccination_create,
            vaccination_get_by_id,
            vaccination_update,
            vaccination_delete,
            vaccination_get_all,
            vaccination_get_by_enfant,
            vaccination_get_by_vaccin,
            
            // Fokotany commands
            fokotany_create,
            fokotany_get_by_id,
            fokotany_get_by_name,
            fokotany_update,
            fokotany_delete,
            fokotany_get_all,
            
            // Hameau commands
            hameau_create,
            hameau_get_by_id,
            hameau_get_by_name,
            hameau_update,
            hameau_delete,
            hameau_get_all,
            
            // Notification commands
            notification_create,
            notification_get_by_id,
            notification_mark_as_read,
            notification_mark_all_as_read,
            notification_delete,
            notification_get_unread_count,
            notification_get_for_user,
            notification_purge_expired
        ])
        .run(tauri::generate_context!())
        .expect("Error while running tauri application");
}
