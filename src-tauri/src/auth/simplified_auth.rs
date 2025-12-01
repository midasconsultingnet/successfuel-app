// Simplified authentication module for SuccessFuel ERP
use std::sync::{Arc, Mutex};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthState {
    pub is_authenticated: bool,
    pub user_id: Option<String>,
    pub username: Option<String>,
    pub permissions: Vec<String>,
    pub token_expires_at: Option<u64>,
}

impl Default for AuthState {
    fn default() -> Self {
        AuthState {
            is_authenticated: false,
            user_id: None,
            username: None,
            permissions: Vec::new(),
            token_expires_at: None,
        }
    }
}

// Simplified auth manager that only handles secure storage
pub struct SimplifiedAuthManager {
    state: Arc<Mutex<AuthState>>,
    token_file_path: PathBuf,
}

impl SimplifiedAuthManager {
    pub fn new(app_handle: &AppHandle) -> Result<Self, String> {
        // Get the app's data directory and create token file path
        let mut token_file_path = app_handle.path().app_data_dir()
            .map_err(|e| format!("Failed to get app data dir: {}", e))?;
        token_file_path.push("token.dat");

        let state = Arc::new(Mutex::new(AuthState::default()));

        // Try to load existing token from storage
        if let Ok(Some(token_data)) = Self::load_token_from_file(&token_file_path) {
            let mut state_guard = state.lock().unwrap();
            state_guard.is_authenticated = true;
            state_guard.user_id = Some(token_data.user_id);
            state_guard.username = Some(token_data.username);
            state_guard.permissions = token_data.permissions;
            state_guard.token_expires_at = Some(token_data.expires_at);
        }

        Ok(SimplifiedAuthManager {
            state,
            token_file_path,
        })
    }

    // Store authentication token securely
    pub fn store_auth_token(&self, token: &str, refresh_token: &str, user_id: &str, username: &str, permissions: Vec<String>) -> Result<(), String> {
        let token_data = TokenData {
            token: token.to_string(),
            refresh_token: refresh_token.to_string(),
            user_id: user_id.to_string(),
            username: username.to_string(),
            permissions,
            expires_at: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs()
                + (30 * 60) // 30 minutes from now
        };

        // Save token to file
        Self::save_token_to_file(&self.token_file_path, &token_data)
            .map_err(|e| format!("Failed to save token: {}", e))?;

        // Update in-memory state
        let mut state = self.state.lock().unwrap();
        state.is_authenticated = true;
        state.user_id = Some(token_data.user_id);
        state.username = Some(token_data.username);
        state.permissions = token_data.permissions;
        state.token_expires_at = Some(token_data.expires_at);

        Ok(())
    }

    // Retrieve authentication token
    pub fn get_auth_token(&self) -> Result<Option<(String, String)>, String> { // Return both access and refresh tokens
        match Self::load_token_from_file(&self.token_file_path) {
            Ok(Some(token_data)) => Ok(Some((token_data.token, token_data.refresh_token))),
            Ok(None) => Ok(None),
            Err(e) => Err(format!("Failed to load token: {}", e))
        }
    }

    // Clear authentication token
    pub fn clear_auth_token(&self) -> Result<(), String> {
        // Remove token file
        if self.token_file_path.exists() {
            std::fs::remove_file(&self.token_file_path)
                .map_err(|e| format!("Failed to remove token file: {}", e))?;
        }

        // Update in-memory state
        let mut state = self.state.lock().unwrap();
        *state = AuthState::default();

        Ok(())
    }

    // Get current authentication state
    pub fn get_state(&self) -> AuthState {
        self.state.lock().unwrap().clone()
    }

    // Check if user is authenticated
    pub fn is_authenticated(&self) -> bool {
        let state = self.state.lock().unwrap();
        state.is_authenticated && !self.is_token_expired()
    }

    // Check if token is expired
    fn is_token_expired(&self) -> bool {
        if let Some(expires_at) = self.state.lock().unwrap().token_expires_at {
            let now = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs();
            expires_at < now
        } else {
            true // If no expiration time, consider expired
        }
    }

    // Save token to file (simplified - just JSON for now)
    fn save_token_to_file(path: &PathBuf, token_data: &TokenData) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let json = serde_json::to_string(token_data)?;
        std::fs::write(path, json)?;
        
        // Set file permissions to be read/write for owner only (on Unix systems)
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let mut perms = std::fs::metadata(path)?.permissions();
            perms.set_mode(0o600);
            std::fs::set_permissions(path, perms)?;
        }

        Ok(())
    }

    // Load token from file
    fn load_token_from_file(path: &PathBuf) -> Result<Option<TokenData>, Box<dyn std::error::Error + Send + Sync>> {
        if !path.exists() {
            return Ok(None);
        }

        let content = std::fs::read_to_string(path)?;
        let token_data: TokenData = serde_json::from_str(&content)?;

        // Check if token is expired
        if token_data.expires_at < std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)?
            .as_secs()
        {
            // Remove expired token
            let _ = std::fs::remove_file(path); // Ignore errors when removing expired token
            return Ok(None);
        }

        Ok(Some(token_data))
    }
}

// Simplified token data structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenData {
    pub token: String,
    pub refresh_token: String,
    pub user_id: String,
    pub username: String,
    pub permissions: Vec<String>,
    pub expires_at: u64,
}