use tauri::command;
use crate::db::{
    models::{Vaccin, VaccinPrerequis, VaccinSuite},
    services::vaccin_service::{
        create_vaccin, get_vaccin_by_id, update_vaccin, delete_vaccin, get_all_vaccins,
        add_vaccin_prerequis, get_vaccin_prerequis, delete_vaccin_prerequis,
        add_vaccin_suite, get_vaccin_suites, delete_vaccin_suite
    }
};

#[command]
pub fn vaccin_create(vaccin: Vaccin) -> Result<i64, String> {
    create_vaccin(&vaccin).map_err(|e| e.to_string())
}

#[command]
pub fn vaccin_get_by_id(vaccin_id: i64) -> Result<Vaccin, String> {
    get_vaccin_by_id(vaccin_id).map_err(|e| e.to_string())
}

#[command]
pub fn vaccin_update(vaccin: Vaccin) -> Result<(), String> {
    update_vaccin(&vaccin).map_err(|e| e.to_string())
}

#[command]
pub fn vaccin_delete(vaccin_id: i64) -> Result<(), String> {
    delete_vaccin(vaccin_id).map_err(|e| e.to_string())
}

#[command]
pub fn vaccin_get_all() -> Result<Vec<Vaccin>, String> {
    get_all_vaccins().map_err(|e| e.to_string())
}

// Prerequis commands
#[command]
pub fn vaccin_add_prerequis(vaccin_id: i64, prerequis_id: i64, strict: bool) -> Result<i64, String> {
    add_vaccin_prerequis(vaccin_id, prerequis_id, strict).map_err(|e| e.to_string())
}

#[command]
pub fn vaccin_get_prerequis(vaccin_id: i64) -> Result<Vec<VaccinPrerequis>, String> {
    get_vaccin_prerequis(vaccin_id).map_err(|e| e.to_string())
}

#[command]
pub fn vaccin_delete_prerequis(prerequis_id: i64) -> Result<(), String> {
    delete_vaccin_prerequis(prerequis_id).map_err(|e| e.to_string())
}

// Suite commands
#[command]
pub fn vaccin_add_suite(suite: VaccinSuite) -> Result<i64, String> {
    add_vaccin_suite(&suite).map_err(|e| e.to_string())
}

#[command]
pub fn vaccin_get_suites(vaccin_id: i64) -> Result<Vec<VaccinSuite>, String> {
    get_vaccin_suites(vaccin_id).map_err(|e| e.to_string())
}

#[command]
pub fn vaccin_delete_suite(suite_id: i64) -> Result<(), String> {
    delete_vaccin_suite(suite_id).map_err(|e| e.to_string())
}
