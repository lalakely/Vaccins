use rusqlite::{params, Result};
use crate::db::{get_connection, models::Enfant};
use chrono::NaiveDate;
use uuid::Uuid;
use serde_json::to_string;

pub fn create_enfant(enfant: &Enfant) -> Result<i64, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    // Generate a unique code if none provided
    let code = match &enfant.code {
        Some(c) if !c.is_empty() => c.to_string(),
        _ => generate_unique_code()?,
    };

    let result = conn.execute(
        "INSERT INTO enfants (
            nom, prenom, code, date_naissance, age_premier_contact,
            sexe, nom_mere, nom_pere, domicile, fokotany, hameau, telephone
        ) VALUES (
            ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12
        )",
        params![
            enfant.nom, 
            enfant.prenom, 
            code, 
            enfant.date_naissance.to_string(), 
            enfant.age_premier_contact,
            enfant.sexe, 
            enfant.nom_mere, 
            enfant.nom_pere, 
            enfant.domicile, 
            enfant.fokotany, 
            enfant.hameau, 
            enfant.telephone
        ],
    )?;
    
    let id = conn.last_insert_rowid();

    // Create a child history record for creation
    if result > 0 {
        let mut new_enfant = enfant.clone();
        new_enfant.id = Some(id);
        let new_data = to_string(&new_enfant)?;
        
        conn.execute(
            "INSERT INTO child_history (child_id, action_type, user_id, new_data)
            VALUES (?1, 'CREATE', ?2, ?3)",
            params![id, None::<i64>, new_data],
        )?;
    }
    
    Ok(id)
}

pub fn get_enfant_by_id(enfant_id: i64) -> Result<Enfant, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT id, nom, prenom, code, date_naissance, age_premier_contact,
            sexe, nom_mere, nom_pere, domicile, fokotany, hameau, telephone,
            created_at, updated_at
         FROM enfants WHERE id = ?1"
    )?;
    
    let enfant = stmt.query_row(params![enfant_id], |row| {
        let date_str: String = row.get(4)?;
        let date_naissance = NaiveDate::parse_from_str(&date_str, "%Y-%m-%d")
            .map_err(|e| rusqlite::Error::FromSqlConversionFailure(4, 
                rusqlite::types::Type::Text, Box::new(e)))?;
        
        Ok(Enfant {
            id: Some(row.get(0)?),
            nom: row.get(1)?,
            prenom: row.get(2)?,
            code: row.get(3)?,
            date_naissance,
            age_premier_contact: row.get(5)?,
            sexe: row.get(6)?,
            nom_mere: row.get(7)?,
            nom_pere: row.get(8)?,
            domicile: row.get(9)?,
            fokotany: row.get(10)?,
            hameau: row.get(11)?,
            telephone: row.get(12)?,
            created_at: row.get(13)?,
            updated_at: row.get(14)?,
        })
    })?;
    
    Ok(enfant)
}

pub fn get_enfant_by_code(code: &str) -> Result<Option<Enfant>, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT id, nom, prenom, code, date_naissance, age_premier_contact,
            sexe, nom_mere, nom_pere, domicile, fokotany, hameau, telephone,
            created_at, updated_at
         FROM enfants WHERE code = ?1"
    )?;
    
    let result = stmt.query_row(params![code], |row| {
        let date_str: String = row.get(4)?;
        let date_naissance = NaiveDate::parse_from_str(&date_str, "%Y-%m-%d")
            .map_err(|e| rusqlite::Error::FromSqlConversionFailure(4, 
                rusqlite::types::Type::Text, Box::new(e)))?;
        
        Ok(Enfant {
            id: Some(row.get(0)?),
            nom: row.get(1)?,
            prenom: row.get(2)?,
            code: row.get(3)?,
            date_naissance,
            age_premier_contact: row.get(5)?,
            sexe: row.get(6)?,
            nom_mere: row.get(7)?,
            nom_pere: row.get(8)?,
            domicile: row.get(9)?,
            fokotany: row.get(10)?,
            hameau: row.get(11)?,
            telephone: row.get(12)?,
            created_at: row.get(13)?,
            updated_at: row.get(14)?,
        })
    });
    
    match result {
        Ok(enfant) => Ok(Some(enfant)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(anyhow::anyhow!("Database error: {}", e)),
    }
}

pub fn update_enfant(enfant: &Enfant) -> Result<(), anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    // Get the old data first for history
    let old_enfant = get_enfant_by_id(enfant.id.unwrap())?;
    let old_data = to_string(&old_enfant)?;
    
    // Update the record
    conn.execute(
        "UPDATE enfants SET 
            nom = ?1,
            prenom = ?2,
            code = ?3,
            date_naissance = ?4,
            age_premier_contact = ?5,
            sexe = ?6,
            nom_mere = ?7,
            nom_pere = ?8,
            domicile = ?9,
            fokotany = ?10,
            hameau = ?11,
            telephone = ?12,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?13",
        params![
            enfant.nom,
            enfant.prenom,
            enfant.code,
            enfant.date_naissance.to_string(),
            enfant.age_premier_contact,
            enfant.sexe,
            enfant.nom_mere,
            enfant.nom_pere,
            enfant.domicile,
            enfant.fokotany,
            enfant.hameau,
            enfant.telephone,
            enfant.id
        ],
    )?;
    
    // Add history record
    let new_data = to_string(&enfant)?;
    conn.execute(
        "INSERT INTO child_history (child_id, action_type, user_id, old_data, new_data)
        VALUES (?1, 'UPDATE', ?2, ?3, ?4)",
        params![enfant.id.unwrap(), None::<i64>, old_data, new_data],
    )?;
    
    Ok(())
}

pub fn delete_enfant(enfant_id: i64, user_id: Option<i64>) -> Result<(), anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    // Get the data for history before deletion
    let enfant = get_enfant_by_id(enfant_id)?;
    let child_data = to_string(&enfant)?;
    
    // Add to deletion log
    conn.execute(
        "INSERT INTO deleted_children_log (original_id, user_id, child_data)
        VALUES (?1, ?2, ?3)",
        params![enfant_id, user_id, child_data],
    )?;
    
    // Add to history
    conn.execute(
        "INSERT INTO child_history (child_id, action_type, user_id, old_data)
        VALUES (?1, 'DELETE', ?2, ?3)",
        params![enfant_id, user_id, child_data],
    )?;
    
    // Delete the record
    conn.execute("DELETE FROM enfants WHERE id = ?1", params![enfant_id])?;
    
    Ok(())
}

pub fn get_all_enfants() -> Result<Vec<Enfant>, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT id, nom, prenom, code, date_naissance, age_premier_contact,
            sexe, nom_mere, nom_pere, domicile, fokotany, hameau, telephone,
            created_at, updated_at
         FROM enfants ORDER BY nom, prenom"
    )?;
    
    let enfant_iter = stmt.query_map([], |row| {
        let date_str: String = row.get(4)?;
        let date_naissance = NaiveDate::parse_from_str(&date_str, "%Y-%m-%d")
            .map_err(|e| rusqlite::Error::FromSqlConversionFailure(4, 
                rusqlite::types::Type::Text, Box::new(e)))?;
        
        Ok(Enfant {
            id: Some(row.get(0)?),
            nom: row.get(1)?,
            prenom: row.get(2)?,
            code: row.get(3)?,
            date_naissance,
            age_premier_contact: row.get(5)?,
            sexe: row.get(6)?,
            nom_mere: row.get(7)?,
            nom_pere: row.get(8)?,
            domicile: row.get(9)?,
            fokotany: row.get(10)?,
            hameau: row.get(11)?,
            telephone: row.get(12)?,
            created_at: row.get(13)?,
            updated_at: row.get(14)?,
        })
    })?;
    
    let mut enfants = Vec::new();
    for enfant in enfant_iter {
        enfants.push(enfant?);
    }
    
    Ok(enfants)
}

fn generate_unique_code() -> Result<String, anyhow::Error> {
    // Generate a short unique code based on UUID
    let uuid = Uuid::new_v4();
    let code = format!("CSB-{}", uuid.to_string().split('-').next().unwrap().to_uppercase());
    
    // Check if code already exists
    match get_enfant_by_code(&code)? {
        Some(_) => generate_unique_code(), // Try again if code already exists
        None => Ok(code),
    }
}
