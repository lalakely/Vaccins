use tauri::command;
use crate::db::{
    models::Vaccination,
    services::vaccination_service::{
        create_vaccination, get_vaccination_by_id, update_vaccination,
        delete_vaccination, get_all_vaccinations, get_vaccinations_by_enfant,
        get_vaccinations_by_vaccin
    }
};

#[command]
pub fn vaccination_create(vaccination: Vaccination) -> Result<i64, String> {
    create_vaccination(&vaccination).map_err(|e| e.to_string())
}

#[command]
pub fn vaccination_get_by_id(vaccination_id: i64) -> Result<Vaccination, String> {
    get_vaccination_by_id(vaccination_id).map_err(|e| e.to_string())
}

#[command]
pub fn vaccination_update(vaccination: Vaccination) -> Result<(), String> {
    update_vaccination(&vaccination).map_err(|e| e.to_string())
}

#[command]
pub fn vaccination_delete(vaccination_id: i64) -> Result<(), String> {
    delete_vaccination(vaccination_id).map_err(|e| e.to_string())
}

#[command]
pub fn vaccination_get_all() -> Result<Vec<Vaccination>, String> {
    get_all_vaccinations().map_err(|e| e.to_string())
}

#[command]
pub fn vaccination_get_by_enfant(enfant_id: i64) -> Result<Vec<Vaccination>, String> {
    get_vaccinations_by_enfant(enfant_id).map_err(|e| e.to_string())
}

#[command]
pub fn vaccination_get_by_vaccin(vaccin_id: i64) -> Result<Vec<Vaccination>, String> {
    get_vaccinations_by_vaccin(vaccin_id).map_err(|e| e.to_string())
}
