use rusqlite::{params, Result};
use crate::db::{get_connection, models::User};

pub fn create_user(user: &User) -> Result<i64, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    conn.execute(
        "INSERT INTO users (username, password_hash, account_type, status)
        VALUES (?1, ?2, ?3, ?4)",
        params![user.username, user.password_hash, user.account_type, user.status],
    )?;
    
    Ok(conn.last_insert_rowid())
}

pub fn get_user_by_id(user_id: i64) -> Result<User, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT id, username, password_hash, account_type, status, created_at, updated_at
        FROM users WHERE id = ?1"
    )?;
    
    let user = stmt.query_row(params![user_id], |row| {
        Ok(User {
            id: Some(row.get(0)?),
            username: row.get(1)?,
            password_hash: row.get(2)?,
            account_type: row.get(3)?,
            status: row.get(4)?,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        })
    })?;
    
    Ok(user)
}

pub fn get_user_by_username(username: &str) -> Result<Option<User>, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT id, username, password_hash, account_type, status, created_at, updated_at
        FROM users WHERE username = ?1"
    )?;
    
    let result = stmt.query_row(params![username], |row| {
        Ok(User {
            id: Some(row.get(0)?),
            username: row.get(1)?,
            password_hash: row.get(2)?,
            account_type: row.get(3)?,
            status: row.get(4)?,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        })
    });
    
    match result {
        Ok(user) => Ok(Some(user)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(anyhow::anyhow!("Database error: {}", e)),
    }
}

pub fn update_user_status(user_id: i64, status: &str) -> Result<(), anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    conn.execute(
        "UPDATE users SET status = ?1, updated_at = CURRENT_TIMESTAMP WHERE id = ?2",
        params![status, user_id],
    )?;
    
    Ok(())
}

pub fn update_user(user: &User) -> Result<(), anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    conn.execute(
        "UPDATE users SET 
            username = ?1,
            password_hash = ?2,
            account_type = ?3,
            status = ?4,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?5",
        params![
            user.username,
            user.password_hash,
            user.account_type,
            user.status,
            user.id
        ],
    )?;
    
    Ok(())
}

pub fn delete_user(user_id: i64) -> Result<(), anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    conn.execute("DELETE FROM users WHERE id = ?1", params![user_id])?;
    
    Ok(())
}

pub fn get_all_users() -> Result<Vec<User>, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT id, username, password_hash, account_type, status, created_at, updated_at
        FROM users ORDER BY username"
    )?;
    
    let user_iter = stmt.query_map([], |row| {
        Ok(User {
            id: Some(row.get(0)?),
            username: row.get(1)?,
            password_hash: row.get(2)?,
            account_type: row.get(3)?,
            status: row.get(4)?,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        })
    })?;
    
    let mut users = Vec::new();
    for user in user_iter {
        users.push(user?);
    }
    
    Ok(users)
}

pub fn create_login_record(user_id: i64, username: &str, ip_address: &str) -> Result<(), anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    conn.execute(
        "INSERT OR REPLACE INTO logins (user_id, username, ip_address, status, last_login)
        VALUES (?1, ?2, ?3, 'connecté', CURRENT_TIMESTAMP)",
        params![user_id, username, ip_address],
    )?;
    
    Ok(())
}

pub fn update_login_status(user_id: i64, status: &str) -> Result<(), anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    conn.execute(
        "UPDATE logins SET status = ?1, last_login = CURRENT_TIMESTAMP WHERE user_id = ?2",
        params![status, user_id],
    )?;
    
    Ok(())
}
