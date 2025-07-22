use tauri::command;
use crate::db::{
    models::Notification,
    services::notification_service::{
        create_notification, get_notification_by_id, mark_notification_as_read,
        mark_all_notifications_as_read, delete_notification, get_unread_notifications_count,
        get_notifications_for_user, purge_expired_notifications
    }
};

#[command]
pub fn notification_create(notification: Notification) -> Result<i64, String> {
    create_notification(&notification).map_err(|e| e.to_string())
}

#[command]
pub fn notification_get_by_id(notification_id: i64) -> Result<Notification, String> {
    get_notification_by_id(notification_id).map_err(|e| e.to_string())
}

#[command]
pub fn notification_mark_as_read(notification_id: i64) -> Result<(), String> {
    mark_notification_as_read(notification_id).map_err(|e| e.to_string())
}

#[command]
pub fn notification_mark_all_as_read(user_id: Option<i64>) -> Result<(), String> {
    mark_all_notifications_as_read(user_id).map_err(|e| e.to_string())
}

#[command]
pub fn notification_delete(notification_id: i64) -> Result<(), String> {
    delete_notification(notification_id).map_err(|e| e.to_string())
}

#[command]
pub fn notification_get_unread_count(user_id: Option<i64>) -> Result<i64, String> {
    get_unread_notifications_count(user_id).map_err(|e| e.to_string())
}

#[command]
pub fn notification_get_for_user(
    user_id: Option<i64>, 
    limit: i64, 
    offset: i64,
    include_read: bool
) -> Result<Vec<Notification>, String> {
    get_notifications_for_user(user_id, limit, offset, include_read).map_err(|e| e.to_string())
}

#[command]
pub fn notification_purge_expired() -> Result<usize, String> {
    purge_expired_notifications().map_err(|e| e.to_string())
}
