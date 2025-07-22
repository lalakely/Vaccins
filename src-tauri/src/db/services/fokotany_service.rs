use rusqlite::{params, Result};
use crate::db::{get_connection, models::Fokotany};

pub fn create_fokotany(fokotany: &Fokotany) -> Result<i64, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    conn.execute(
        "INSERT INTO fokotany (nom, px, py) VALUES (?1, ?2, ?3)",
        params![fokotany.nom, fokotany.px, fokotany.py],
    )?;
    
    Ok(conn.last_insert_rowid())
}

pub fn get_fokotany_by_id(id: i64) -> Result<Fokotany, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT id, nom, px, py, created_at, updated_at FROM fokotany WHERE id = ?1"
    )?;
    
    let fokotany = stmt.query_row(params![id], |row| {
        Ok(Fokotany {
            id: Some(row.get(0)?),
            nom: row.get(1)?,
            px: row.get(2)?,
            py: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    })?;
    
    Ok(fokotany)
}

pub fn get_fokotany_by_name(name: &str) -> Result<Option<Fokotany>, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT id, nom, px, py, created_at, updated_at FROM fokotany WHERE nom = ?1"
    )?;
    
    let result = stmt.query_row(params![name], |row| {
        Ok(Fokotany {
            id: Some(row.get(0)?),
            nom: row.get(1)?,
            px: row.get(2)?,
            py: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    });
    
    match result {
        Ok(fokotany) => Ok(Some(fokotany)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(anyhow::anyhow!("Database error: {}", e)),
    }
}

pub fn update_fokotany(fokotany: &Fokotany) -> Result<(), anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    conn.execute(
        "UPDATE fokotany SET nom = ?1, px = ?2, py = ?3, updated_at = CURRENT_TIMESTAMP WHERE id = ?4",
        params![fokotany.nom, fokotany.px, fokotany.py, fokotany.id],
    )?;
    
    Ok(())
}

pub fn delete_fokotany(id: i64) -> Result<(), anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    // Update enfants associated with this fokotany to clear the reference
    conn.execute(
        "UPDATE enfants SET fokotany = NULL WHERE fokotany = (SELECT nom FROM fokotany WHERE id = ?1)",
        params![id],
    )?;
    
    // Delete the fokotany
    conn.execute("DELETE FROM fokotany WHERE id = ?1", params![id])?;
    
    Ok(())
}

pub fn get_all_fokotany() -> Result<Vec<Fokotany>, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT id, nom, px, py, created_at, updated_at FROM fokotany ORDER BY nom"
    )?;
    
    let fokotany_iter = stmt.query_map([], |row| {
        Ok(Fokotany {
            id: Some(row.get(0)?),
            nom: row.get(1)?,
            px: row.get(2)?,
            py: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    })?;
    
    let mut fokotanys = Vec::new();
    for fokotany in fokotany_iter {
        fokotanys.push(fokotany?);
    }
    
    Ok(fokotanys)
}
