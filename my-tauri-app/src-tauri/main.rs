// This file is the main entry point for the Tauri application.
// It initializes the Tauri application and sets up the communication between the frontend and backend.

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}