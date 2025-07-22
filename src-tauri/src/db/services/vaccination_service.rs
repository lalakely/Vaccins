use rusqlite::{params, Result};
use crate::db::{get_connection, models::Vaccination};
use chrono::NaiveDate;

pub fn create_vaccination(vaccination: &Vaccination) -> Result<i64, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    conn.execute(
        "INSERT INTO vaccinations (
            enfant_id, vaccin_id, date_vaccination, remarque
        ) VALUES (?1, ?2, ?3, ?4)",
        params![
            vaccination.enfant_id,
            vaccination.vaccin_id,
            vaccination.date_vaccination.to_string(),
            vaccination.remarque
        ],
    )?;
    
    Ok(conn.last_insert_rowid())
}

pub fn get_vaccination_by_id(vaccination_id: i64) -> Result<Vaccination, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT id, enfant_id, vaccin_id, date_vaccination, remarque, created_at, updated_at
         FROM vaccinations WHERE id = ?1"
    )?;
    
    let vaccination = stmt.query_row(params![vaccination_id], |row| {
        let date_str: String = row.get(3)?;
        let date_vaccination = NaiveDate::parse_from_str(&date_str, "%Y-%m-%d")
            .map_err(|e| rusqlite::Error::FromSqlConversionFailure(3, 
                rusqlite::types::Type::Text, Box::new(e)))?;
        
        Ok(Vaccination {
            id: Some(row.get(0)?),
            enfant_id: row.get(1)?,
            vaccin_id: row.get(2)?,
            date_vaccination,
            remarque: row.get(4)?,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        })
    })?;
    
    Ok(vaccination)
}

pub fn update_vaccination(vaccination: &Vaccination) -> Result<(), anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    conn.execute(
        "UPDATE vaccinations SET 
            enfant_id = ?1,
            vaccin_id = ?2,
            date_vaccination = ?3,
            remarque = ?4,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?5",
        params![
            vaccination.enfant_id,
            vaccination.vaccin_id,
            vaccination.date_vaccination.to_string(),
            vaccination.remarque,
            vaccination.id
        ],
    )?;
    
    Ok(())
}

pub fn delete_vaccination(vaccination_id: i64) -> Result<(), anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    conn.execute("DELETE FROM vaccinations WHERE id = ?1", params![vaccination_id])?;
    
    Ok(())
}

pub fn get_all_vaccinations() -> Result<Vec<Vaccination>, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT id, enfant_id, vaccin_id, date_vaccination, remarque, created_at, updated_at
         FROM vaccinations ORDER BY date_vaccination DESC"
    )?;
    
    let vaccination_iter = stmt.query_map([], |row| {
        let date_str: String = row.get(3)?;
        let date_vaccination = NaiveDate::parse_from_str(&date_str, "%Y-%m-%d")
            .map_err(|e| rusqlite::Error::FromSqlConversionFailure(3, 
                rusqlite::types::Type::Text, Box::new(e)))?;
        
        Ok(Vaccination {
            id: Some(row.get(0)?),
            enfant_id: row.get(1)?,
            vaccin_id: row.get(2)?,
            date_vaccination,
            remarque: row.get(4)?,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        })
    })?;
    
    let mut vaccinations = Vec::new();
    for vaccination in vaccination_iter {
        vaccinations.push(vaccination?);
    }
    
    Ok(vaccinations)
}

pub fn get_vaccinations_by_enfant(enfant_id: i64) -> Result<Vec<Vaccination>, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT id, enfant_id, vaccin_id, date_vaccination, remarque, created_at, updated_at
         FROM vaccinations WHERE enfant_id = ?1 ORDER BY date_vaccination DESC"
    )?;
    
    let vaccination_iter = stmt.query_map(params![enfant_id], |row| {
        let date_str: String = row.get(3)?;
        let date_vaccination = NaiveDate::parse_from_str(&date_str, "%Y-%m-%d")
            .map_err(|e| rusqlite::Error::FromSqlConversionFailure(3, 
                rusqlite::types::Type::Text, Box::new(e)))?;
        
        Ok(Vaccination {
            id: Some(row.get(0)?),
            enfant_id: row.get(1)?,
            vaccin_id: row.get(2)?,
            date_vaccination,
            remarque: row.get(4)?,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        })
    })?;
    
    let mut vaccinations = Vec::new();
    for vaccination in vaccination_iter {
        vaccinations.push(vaccination?);
    }
    
    Ok(vaccinations)
}

pub fn get_vaccinations_by_vaccin(vaccin_id: i64) -> Result<Vec<Vaccination>, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT id, enfant_id, vaccin_id, date_vaccination, remarque, created_at, updated_at
         FROM vaccinations WHERE vaccin_id = ?1 ORDER BY date_vaccination DESC"
    )?;
    
    let vaccination_iter = stmt.query_map(params![vaccin_id], |row| {
        let date_str: String = row.get(3)?;
        let date_vaccination = NaiveDate::parse_from_str(&date_str, "%Y-%m-%d")
            .map_err(|e| rusqlite::Error::FromSqlConversionFailure(3, 
                rusqlite::types::Type::Text, Box::new(e)))?;
        
        Ok(Vaccination {
            id: Some(row.get(0)?),
            enfant_id: row.get(1)?,
            vaccin_id: row.get(2)?,
            date_vaccination,
            remarque: row.get(4)?,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        })
    })?;
    
    let mut vaccinations = Vec::new();
    for vaccination in vaccination_iter {
        vaccinations.push(vaccination?);
    }
    
    Ok(vaccinations)
}
