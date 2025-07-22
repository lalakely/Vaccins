use rusqlite::{params, Result};
use crate::db::{get_connection, models::{Vaccin, VaccinPrerequis, VaccinSuite}};
use chrono::NaiveDate;

pub fn create_vaccin(vaccin: &Vaccin) -> Result<i64, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    let date_arrivee = vaccin.date_arrivee.map(|d| d.to_string());
    let date_peremption = vaccin.date_peremption.map(|d| d.to_string());

    conn.execute(
        "INSERT INTO vaccins (
            nom, duree, date_arrivee, date_peremption, description, 
            duree_jours, age_annees, age_mois, age_jours, lot, stock
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        params![
            vaccin.nom,
            vaccin.duree,
            date_arrivee,
            date_peremption,
            vaccin.description,
            vaccin.duree_jours,
            vaccin.age_annees,
            vaccin.age_mois,
            vaccin.age_jours,
            vaccin.lot,
            vaccin.stock
        ],
    )?;
    
    Ok(conn.last_insert_rowid())
}

pub fn get_vaccin_by_id(vaccin_id: i64) -> Result<Vaccin, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT id, nom, duree, date_arrivee, date_peremption, description, 
               created_at, updated_at, duree_jours, age_annees, age_mois, age_jours, lot, stock
         FROM vaccins WHERE id = ?1"
    )?;
    
    let vaccin = stmt.query_row(params![vaccin_id], |row| {
        // Parse dates if they exist
        let date_arrivee: Option<String> = row.get(3)?;
        let date_arrivee = date_arrivee.and_then(|d| NaiveDate::parse_from_str(&d, "%Y-%m-%d").ok());
        
        let date_peremption: Option<String> = row.get(4)?;
        let date_peremption = date_peremption.and_then(|d| NaiveDate::parse_from_str(&d, "%Y-%m-%d").ok());
        
        Ok(Vaccin {
            id: Some(row.get(0)?),
            nom: row.get(1)?,
            duree: row.get(2)?,
            date_arrivee,
            date_peremption,
            description: row.get(5)?,
            created_at: row.get(6)?,
            updated_at: row.get(7)?,
            duree_jours: row.get(8)?,
            age_annees: row.get(9)?,
            age_mois: row.get(10)?,
            age_jours: row.get(11)?,
            lot: row.get(12)?,
            stock: row.get(13)?,
        })
    })?;
    
    Ok(vaccin)
}

pub fn update_vaccin(vaccin: &Vaccin) -> Result<(), anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    let date_arrivee = vaccin.date_arrivee.map(|d| d.to_string());
    let date_peremption = vaccin.date_peremption.map(|d| d.to_string());
    
    conn.execute(
        "UPDATE vaccins SET 
            nom = ?1,
            duree = ?2,
            date_arrivee = ?3,
            date_peremption = ?4,
            description = ?5,
            duree_jours = ?6,
            age_annees = ?7,
            age_mois = ?8,
            age_jours = ?9,
            lot = ?10,
            stock = ?11,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?12",
        params![
            vaccin.nom,
            vaccin.duree,
            date_arrivee,
            date_peremption,
            vaccin.description,
            vaccin.duree_jours,
            vaccin.age_annees,
            vaccin.age_mois,
            vaccin.age_jours,
            vaccin.lot,
            vaccin.stock,
            vaccin.id
        ],
    )?;
    
    Ok(())
}

pub fn delete_vaccin(vaccin_id: i64) -> Result<(), anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    conn.execute("DELETE FROM vaccins WHERE id = ?1", params![vaccin_id])?;
    
    Ok(())
}

pub fn get_all_vaccins() -> Result<Vec<Vaccin>, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT id, nom, duree, date_arrivee, date_peremption, description, 
                created_at, updated_at, duree_jours, age_annees, age_mois, age_jours, lot, stock
         FROM vaccins ORDER BY nom"
    )?;
    
    let vaccin_iter = stmt.query_map([], |row| {
        // Parse dates if they exist
        let date_arrivee: Option<String> = row.get(3)?;
        let date_arrivee = date_arrivee.and_then(|d| NaiveDate::parse_from_str(&d, "%Y-%m-%d").ok());
        
        let date_peremption: Option<String> = row.get(4)?;
        let date_peremption = date_peremption.and_then(|d| NaiveDate::parse_from_str(&d, "%Y-%m-%d").ok());
        
        Ok(Vaccin {
            id: Some(row.get(0)?),
            nom: row.get(1)?,
            duree: row.get(2)?,
            date_arrivee,
            date_peremption,
            description: row.get(5)?,
            created_at: row.get(6)?,
            updated_at: row.get(7)?,
            duree_jours: row.get(8)?,
            age_annees: row.get(9)?,
            age_mois: row.get(10)?,
            age_jours: row.get(11)?,
            lot: row.get(12)?,
            stock: row.get(13)?,
        })
    })?;
    
    let mut vaccins = Vec::new();
    for vaccin in vaccin_iter {
        vaccins.push(vaccin?);
    }
    
    Ok(vaccins)
}

// Manage Vaccin Prerequis
pub fn add_vaccin_prerequis(vaccin_id: i64, prerequis_id: i64, strict: bool) -> Result<i64, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    conn.execute(
        "INSERT INTO vaccin_prerequis (vaccin_id, prerequis_id, strict)
         VALUES (?1, ?2, ?3)",
        params![vaccin_id, prerequis_id, strict as i32],
    )?;
    
    Ok(conn.last_insert_rowid())
}

pub fn get_vaccin_prerequis(vaccin_id: i64) -> Result<Vec<VaccinPrerequis>, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT id, vaccin_id, prerequis_id, strict
         FROM vaccin_prerequis WHERE vaccin_id = ?1"
    )?;
    
    let prerequis_iter = stmt.query_map(params![vaccin_id], |row| {
        Ok(VaccinPrerequis {
            id: Some(row.get(0)?),
            vaccin_id: row.get(1)?,
            prerequis_id: row.get(2)?,
            strict: row.get::<_, i32>(3)? != 0,
        })
    })?;
    
    let mut prerequis = Vec::new();
    for pre in prerequis_iter {
        prerequis.push(pre?);
    }
    
    Ok(prerequis)
}

pub fn delete_vaccin_prerequis(prerequis_id: i64) -> Result<(), anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    conn.execute(
        "DELETE FROM vaccin_prerequis WHERE id = ?1",
        params![prerequis_id],
    )?;
    
    Ok(())
}

// Manage Vaccin Suite
pub fn add_vaccin_suite(suite: &VaccinSuite) -> Result<i64, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    conn.execute(
        "INSERT INTO vaccin_suite (vaccin_id, suite_id, strict, delai, type, description)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![
            suite.vaccin_id,
            suite.suite_id,
            suite.strict as i32,
            suite.delai,
            suite.type_suite,
            suite.description
        ],
    )?;
    
    Ok(conn.last_insert_rowid())
}

pub fn get_vaccin_suites(vaccin_id: i64) -> Result<Vec<VaccinSuite>, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT id, vaccin_id, suite_id, strict, delai, type, description
         FROM vaccin_suite WHERE vaccin_id = ?1"
    )?;
    
    let suite_iter = stmt.query_map(params![vaccin_id], |row| {
        Ok(VaccinSuite {
            id: Some(row.get(0)?),
            vaccin_id: row.get(1)?,
            suite_id: row.get(2)?,
            strict: row.get::<_, i32>(3)? != 0,
            delai: row.get(4)?,
            type_suite: row.get(5)?,
            description: row.get(6)?,
        })
    })?;
    
    let mut suites = Vec::new();
    for suite in suite_iter {
        suites.push(suite?);
    }
    
    Ok(suites)
}

pub fn delete_vaccin_suite(suite_id: i64) -> Result<(), anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    conn.execute(
        "DELETE FROM vaccin_suite WHERE id = ?1",
        params![suite_id],
    )?;
    
    Ok(())
}
