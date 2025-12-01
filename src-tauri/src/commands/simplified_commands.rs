// Simplified Tauri commands for SuccessFuel ERP
use tauri::State;
use std::sync::Mutex;
use crate::auth::simplified_auth::SimplifiedAuthManager;

// State for managing authentication
pub struct SimplifiedAuthState(pub Mutex<SimplifiedAuthManager>);

#[tauri::command]
pub fn test_command(
    value: String,
    refresh_token: String  // Using snake_case to test explicit correspondence
) -> Result<String, String> {
    Ok(format!("Test successful: {} - {}", value, refresh_token))
}

#[tauri::command]
pub fn store_auth_token(
    auth_state: State<'_, SimplifiedAuthState>,
    token: String,
    refresh_token: String,
    user_id: String,
    username: String,
    permissions: Vec<String>
) -> Result<(), String> {
    println!("Rust: store_auth_token called with token length: {}, refresh_token length: {}, user_id: {}, username: {}", 
             token.len(), refresh_token.len(), user_id, username);
    
    let result = auth_state
        .0
        .lock()
        .unwrap()
        .store_auth_token(&token, &refresh_token, &user_id, &username, permissions)
        .map_err(|e| format!("Failed to store auth token: {}", e));
        
    match &result {
        Ok(_) => println!("Rust: store_auth_token succeeded"),
        Err(e) => println!("Rust: store_auth_token failed with error: {}", e),
    }
    
    result
}

#[tauri::command]
pub fn get_auth_token(
    auth_state: State<'_, SimplifiedAuthState>
) -> Result<Option<(String, String)>, String> { // Return both access and refresh tokens
    println!("Rust: get_auth_token called");
    
    let result = auth_state
        .0
        .lock()
        .unwrap()
        .get_auth_token()
        .map_err(|e| format!("Failed to get auth token: {}", e));
        
    match &result {
        Ok(Some((token, refresh_token))) => println!("Rust: get_auth_token succeeded, returning tokens with lengths: {}, {}", 
                                                     token.len(), refresh_token.len()),
        Ok(None) => println!("Rust: get_auth_token succeeded, but no tokens found"),
        Err(e) => println!("Rust: get_auth_token failed with error: {}", e),
    }

    result
}

#[tauri::command]
pub fn clear_auth_token(
    auth_state: State<'_, SimplifiedAuthState>
) -> Result<(), String> {
    println!("Rust: clear_auth_token called");
    
    let result = auth_state
        .0
        .lock()
        .unwrap()
        .clear_auth_token()
        .map_err(|e| format!("Failed to clear auth token: {}", e));
        
    match &result {
        Ok(_) => println!("Rust: clear_auth_token succeeded"),
        Err(e) => println!("Rust: clear_auth_token failed with error: {}", e),
    }
    
    result
}

#[tauri::command]
pub fn is_authenticated(
    auth_state: State<'_, SimplifiedAuthState>
) -> Result<bool, String> {
    let result = auth_state.0.lock().unwrap().is_authenticated();
    println!("Rust: is_authenticated called, result: {}", result);
    Ok(result)
}

#[tauri::command]
pub fn get_user_permissions(
    auth_state: State<'_, SimplifiedAuthState>
) -> Result<Vec<String>, String> {
    let state = auth_state.0.lock().unwrap().get_state();
    let permissions = state.permissions;
    println!("Rust: get_user_permissions called, returning {} permissions", permissions.len());
    Ok(permissions)
}

#[tauri::command]
pub fn get_current_user(
    auth_state: State<'_, SimplifiedAuthState>
) -> Result<Option<(String, String)>, String> {  // (user_id, username)
    let state = auth_state.0.lock().unwrap().get_state();
    println!("Rust: get_current_user called, is_authenticated: {}", state.is_authenticated);
    
    if state.is_authenticated {
        if let (Some(user_id), Some(username)) = (state.user_id, state.username) {
            println!("Rust: get_current_user returning user_id: {}, username: {}", user_id, username);
            Ok(Some((user_id, username)))
        } else {
            println!("Rust: get_current_user - user_id or username is None");
            Ok(None)
        }
    } else {
        println!("Rust: get_current_user - user not authenticated");
        Ok(None)
    }
}