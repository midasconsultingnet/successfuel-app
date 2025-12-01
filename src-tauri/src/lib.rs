// Simplified ERP System Core
mod auth;
mod commands;

use tauri::Manager;

// Import simplified command functions
use commands::simplified_commands::{
    test_command,
    store_auth_token, get_auth_token, clear_auth_token,
    is_authenticated, get_user_permissions, get_current_user,
    SimplifiedAuthState
};

// Core greeting command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from SuccessFuel ERP!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            greet,
            test_command,  // Add test command
            // Simplified authentication commands
            store_auth_token,
            get_auth_token,
            clear_auth_token,
            is_authenticated,
            get_user_permissions,
            get_current_user
        ])
        .setup(|app| {
            // Initialize simplified authentication manager
            let auth_manager = crate::auth::simplified_auth::SimplifiedAuthManager::new(app.handle())
                .map_err(|e| format!("Failed to create auth manager: {}", e))?;
            app.manage(SimplifiedAuthState(std::sync::Mutex::new(auth_manager)));
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running SuccessFuel ERP application");
}