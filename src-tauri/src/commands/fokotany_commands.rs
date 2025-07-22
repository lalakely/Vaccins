use tauri::command;
use crate::db::{
    models::Fokotany,
    services::fokotany_service::{
        create_fokotany, get_fokotany_by_id, get_fokotany_by_name,
        update_fokotany, delete_fokotany, get_all_fokotany
    }
};

#[command]
pub fn fokotany_create(fokotany: Fokotany) -> Result<i64, String> {
    create_fokotany(&fokotany).map_err(|e| e.to_string())
}

#[command]
pub fn fokotany_get_by_id(fokotany_id: i64) -> Result<Fokotany, String> {
    get_fokotany_by_id(fokotany_id).map_err(|e| e.to_string())
}

#[command]
pub fn fokotany_get_by_name(name: String) -> Result<Option<Fokotany>, String> {
    get_fokotany_by_name(&name).map_err(|e| e.to_string())
}

#[command]
pub fn fokotany_update(fokotany: Fokotany) -> Result<(), String> {
    update_fokotany(&fokotany).map_err(|e| e.to_string())
}

#[command]
pub fn fokotany_delete(fokotany_id: i64) -> Result<(), String> {
    delete_fokotany(fokotany_id).map_err(|e| e.to_string())
}

#[command]
pub fn fokotany_get_all() -> Result<Vec<Fokotany>, String> {
    get_all_fokotany().map_err(|e| e.to_string())
}
