use tauri::command;
use crate::db::{
    models::Enfant,
    services::enfant_service::{
        create_enfant, get_enfant_by_id, get_enfant_by_code,
        update_enfant, delete_enfant, get_all_enfants
    }
};

#[command]
pub fn enfant_create(enfant: Enfant) -> Result<i64, String> {
    create_enfant(&enfant).map_err(|e| e.to_string())
}

#[command]
pub fn enfant_get_by_id(enfant_id: i64) -> Result<Enfant, String> {
    get_enfant_by_id(enfant_id).map_err(|e| e.to_string())
}

#[command]
pub fn enfant_get_by_code(code: String) -> Result<Option<Enfant>, String> {
    get_enfant_by_code(&code).map_err(|e| e.to_string())
}

#[command]
pub fn enfant_update(enfant: Enfant) -> Result<(), String> {
    update_enfant(&enfant).map_err(|e| e.to_string())
}

#[command]
pub fn enfant_delete(enfant_id: i64, user_id: Option<i64>) -> Result<(), String> {
    delete_enfant(enfant_id, user_id).map_err(|e| e.to_string())
}

#[command]
pub fn enfant_get_all() -> Result<Vec<Enfant>, String> {
    get_all_enfants().map_err(|e| e.to_string())
}
