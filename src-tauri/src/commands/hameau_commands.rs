use tauri::command;
use crate::db::{
    models::Hameau,
    services::hameau_service::{
        create_hameau, get_hameau_by_id, get_hameau_by_name,
        update_hameau, delete_hameau, get_all_hameaux
    }
};

#[command]
pub fn hameau_create(hameau: Hameau) -> Result<i64, String> {
    create_hameau(&hameau).map_err(|e| e.to_string())
}

#[command]
pub fn hameau_get_by_id(hameau_id: i64) -> Result<Hameau, String> {
    get_hameau_by_id(hameau_id).map_err(|e| e.to_string())
}

#[command]
pub fn hameau_get_by_name(name: String) -> Result<Option<Hameau>, String> {
    get_hameau_by_name(&name).map_err(|e| e.to_string())
}

#[command]
pub fn hameau_update(hameau: Hameau) -> Result<(), String> {
    update_hameau(&hameau).map_err(|e| e.to_string())
}

#[command]
pub fn hameau_delete(hameau_id: i64) -> Result<(), String> {
    delete_hameau(hameau_id).map_err(|e| e.to_string())
}

#[command]
pub fn hameau_get_all() -> Result<Vec<Hameau>, String> {
    get_all_hameaux().map_err(|e| e.to_string())
}
