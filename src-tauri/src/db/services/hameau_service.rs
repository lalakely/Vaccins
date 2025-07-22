use rusqlite::{params, Result};
use crate::db::{get_connection, models::Hameau};

pub fn create_hameau(hameau: &Hameau) -> Result<i64, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    conn.execute(
        "INSERT INTO hameau (nom, px, py) VALUES (?1, ?2, ?3)",
        params![hameau.nom, hameau.px, hameau.py],
    )?;
    
    Ok(conn.last_insert_rowid())
}

pub fn get_hameau_by_id(id: i64) -> Result<Hameau, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT id, nom, px, py, created_at, updated_at FROM hameau WHERE id = ?1"
    )?;
    
    let hameau = stmt.query_row(params![id], |row| {
        Ok(Hameau {
            id: Some(row.get(0)?),
            nom: row.get(1)?,
            px: row.get(2)?,
            py: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    })?;
    
    Ok(hameau)
}

pub fn get_hameau_by_name(name: &str) -> Result<Option<Hameau>, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT id, nom, px, py, created_at, updated_at FROM hameau WHERE nom = ?1"
    )?;
    
    let result = stmt.query_row(params![name], |row| {
        Ok(Hameau {
            id: Some(row.get(0)?),
            nom: row.get(1)?,
            px: row.get(2)?,
            py: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    });
    
    match result {
        Ok(hameau) => Ok(Some(hameau)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(anyhow::anyhow!("Database error: {}", e)),
    }
}

pub fn update_hameau(hameau: &Hameau) -> Result<(), anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    conn.execute(
        "UPDATE hameau SET nom = ?1, px = ?2, py = ?3, updated_at = CURRENT_TIMESTAMP WHERE id = ?4",
        params![hameau.nom, hameau.px, hameau.py, hameau.id],
    )?;
    
    Ok(())
}

pub fn delete_hameau(id: i64) -> Result<(), anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    // Update enfants associated with this hameau to clear the reference
    conn.execute(
        "UPDATE enfants SET hameau = NULL WHERE hameau = (SELECT nom FROM hameau WHERE id = ?1)",
        params![id],
    )?;
    
    // Delete the hameau
    conn.execute("DELETE FROM hameau WHERE id = ?1", params![id])?;
    
    Ok(())
}

pub fn get_all_hameaux() -> Result<Vec<Hameau>, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT id, nom, px, py, created_at, updated_at FROM hameau ORDER BY nom"
    )?;
    
    let hameau_iter = stmt.query_map([], |row| {
        Ok(Hameau {
            id: Some(row.get(0)?),
            nom: row.get(1)?,
            px: row.get(2)?,
            py: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    })?;
    
    let mut hameaux = Vec::new();
    for hameau in hameau_iter {
        hameaux.push(hameau?);
    }
    
    Ok(hameaux)
}
