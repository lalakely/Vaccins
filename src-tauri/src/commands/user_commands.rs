use tauri::command;
use crate::db::{
    models::User,
    services::user_service::{
        create_user, get_user_by_id, get_user_by_username, update_user,
        delete_user, get_all_users, update_user_status, create_login_record,
        update_login_status
    }
};

#[command]
pub fn user_register(
    username: String, 
    password_hash: String, 
    account_type: Option<String>
) -> Result<i64, String> {
    let user = User {
        id: None,
        username,
        password_hash,
        account_type: account_type.unwrap_or_else(|| "user".to_string()),
        status: "déconnecté".to_string(),
        created_at: None,
        updated_at: None,
    };
    
    create_user(&user).map_err(|e| e.to_string())
}

#[command]
pub fn user_login(username: String, ip_address: String) -> Result<User, String> {
    // Get the user
    let user_opt = get_user_by_username(&username).map_err(|e| e.to_string())?;
    let user = user_opt.ok_or_else(|| "User not found".to_string())?;
    
    // Update user status
    let user_id = user.id.unwrap();
    update_user_status(user_id, "connecté").map_err(|e| e.to_string())?;
    
    // Create login record
    create_login_record(user_id, &username, &ip_address).map_err(|e| e.to_string())?;
    
    // Get updated user
    get_user_by_id(user_id).map_err(|e| e.to_string())
}

#[command]
pub fn user_logout(user_id: i64) -> Result<(), String> {
    update_user_status(user_id, "déconnecté").map_err(|e| e.to_string())?;
    update_login_status(user_id, "déconnecté").map_err(|e| e.to_string())
}

#[command]
pub fn user_get_by_id(user_id: i64) -> Result<User, String> {
    get_user_by_id(user_id).map_err(|e| e.to_string())
}

#[command]
pub fn user_get_by_username(username: String) -> Result<Option<User>, String> {
    get_user_by_username(&username).map_err(|e| e.to_string())
}

#[command]
pub fn user_update(user: User) -> Result<(), String> {
    update_user(&user).map_err(|e| e.to_string())
}

#[command]
pub fn user_delete(user_id: i64) -> Result<(), String> {
    delete_user(user_id).map_err(|e| e.to_string())
}

#[command]
pub fn user_get_all() -> Result<Vec<User>, String> {
    get_all_users().map_err(|e| e.to_string())
}
