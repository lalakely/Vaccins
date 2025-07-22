use rusqlite::{params, Result};
use crate::db::{get_connection, models::Notification};
use chrono::DateTime;

pub fn create_notification(notification: &Notification) -> Result<i64, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    let expires_at = notification.expires_at.map(|d| d.to_string());
    
    conn.execute(
        "INSERT INTO notifications (
            user_id, title, message, type, category, is_read, 
            action_link, entity_type, entity_id, expires_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        params![
            notification.user_id,
            notification.title,
            notification.message,
            notification.notification_type,
            notification.category,
            notification.is_read,
            notification.action_link,
            notification.entity_type,
            notification.entity_id,
            expires_at
        ],
    )?;
    
    Ok(conn.last_insert_rowid())
}

pub fn get_notification_by_id(notification_id: i64) -> Result<Notification, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT id, user_id, title, message, type, category, 
                is_read, action_link, entity_type, entity_id, created_at, expires_at
         FROM notifications WHERE id = ?1"
    )?;
    
    let notification = stmt.query_row(params![notification_id], |row| {
        Ok(Notification {
            id: Some(row.get(0)?),
            user_id: row.get(1)?,
            title: row.get(2)?,
            message: row.get(3)?,
            notification_type: row.get(4)?,
            category: row.get(5)?,
            is_read: row.get(6)?,
            action_link: row.get(7)?,
            entity_type: row.get(8)?,
            entity_id: row.get(9)?,
            created_at: row.get(10)?,
            expires_at: row.get(11)?,
        })
    })?;
    
    Ok(notification)
}

pub fn mark_notification_as_read(notification_id: i64) -> Result<(), anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    conn.execute(
        "UPDATE notifications SET is_read = 1 WHERE id = ?1",
        params![notification_id],
    )?;
    
    Ok(())
}

pub fn mark_all_notifications_as_read(user_id: Option<i64>) -> Result<(), anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    match user_id {
        Some(id) => {
            conn.execute(
                "UPDATE notifications SET is_read = 1 WHERE user_id = ?1",
                params![id],
            )?;
        },
        None => {
            conn.execute(
                "UPDATE notifications SET is_read = 1 WHERE user_id IS NULL",
                [],
            )?;
        }
    }
    
    Ok(())
}

pub fn delete_notification(notification_id: i64) -> Result<(), anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    conn.execute(
        "DELETE FROM notifications WHERE id = ?1",
        params![notification_id],
    )?;
    
    Ok(())
}

pub fn get_unread_notifications_count(user_id: Option<i64>) -> Result<i64, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    let count = match user_id {
        Some(id) => {
            conn.query_row(
                "SELECT COUNT(*) FROM notifications 
                WHERE user_id = ?1 AND is_read = 0 
                AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)",
                params![id],
                |row| row.get(0),
            )?
        },
        None => {
            conn.query_row(
                "SELECT COUNT(*) FROM notifications 
                WHERE user_id IS NULL AND is_read = 0 
                AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)",
                [],
                |row| row.get(0),
            )?
        }
    };
    
    Ok(count)
}

pub fn get_notifications_for_user(
    user_id: Option<i64>, 
    limit: i64, 
    offset: i64,
    include_read: bool
) -> Result<Vec<Notification>, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    let query = match (user_id, include_read) {
        (Some(id), true) => {
            "SELECT id, user_id, title, message, type, category, 
                    is_read, action_link, entity_type, entity_id, created_at, expires_at
             FROM notifications 
             WHERE user_id = ?1 
             AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
             ORDER BY created_at DESC
             LIMIT ?2 OFFSET ?3"
        },
        (Some(id), false) => {
            "SELECT id, user_id, title, message, type, category, 
                    is_read, action_link, entity_type, entity_id, created_at, expires_at
             FROM notifications 
             WHERE user_id = ?1 AND is_read = 0 
             AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
             ORDER BY created_at DESC
             LIMIT ?2 OFFSET ?3"
        },
        (None, true) => {
            "SELECT id, user_id, title, message, type, category, 
                    is_read, action_link, entity_type, entity_id, created_at, expires_at
             FROM notifications 
             WHERE user_id IS NULL 
             AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
             ORDER BY created_at DESC
             LIMIT ?1 OFFSET ?2"
        },
        (None, false) => {
            "SELECT id, user_id, title, message, type, category, 
                    is_read, action_link, entity_type, entity_id, created_at, expires_at
             FROM notifications 
             WHERE user_id IS NULL AND is_read = 0 
             AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
             ORDER BY created_at DESC
             LIMIT ?1 OFFSET ?2"
        }
    };
    
    let mut stmt = match user_id {
        Some(id) => conn.prepare(query)?.query(params![id, limit, offset])?,
        None => conn.prepare(query)?.query(params![limit, offset])?,
    };
    
    let mut notifications = Vec::new();
    while let Some(row) = stmt.next()? {
        notifications.push(Notification {
            id: Some(row.get(0)?),
            user_id: row.get(1)?,
            title: row.get(2)?,
            message: row.get(3)?,
            notification_type: row.get(4)?,
            category: row.get(5)?,
            is_read: row.get(6)?,
            action_link: row.get(7)?,
            entity_type: row.get(8)?,
            entity_id: row.get(9)?,
            created_at: row.get(10)?,
            expires_at: row.get(11)?,
        });
    }
    
    Ok(notifications)
}

// Purge expired notifications
pub fn purge_expired_notifications() -> Result<usize, anyhow::Error> {
    let conn = get_connection()?;
    let conn = conn.as_ref().unwrap();
    
    let count = conn.execute(
        "DELETE FROM notifications WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP",
        [],
    )?;
    
    Ok(count)
}
