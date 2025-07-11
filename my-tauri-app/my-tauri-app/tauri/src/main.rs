// This file contains the main Rust code for the Tauri application. It sets up the Tauri application and defines the commands that can be called from the frontend.

use tauri::{CustomMenuItem, Menu, MenuItem, Submenu, Builder};

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let submenu = Submenu::new("File", Menu::new().add_item(quit));
    let menu = Menu::new().add_submenu(submenu);

    Builder::default()
        .menu(menu)
        .on_menu_event(|event| {
            if event.menu_item_id() == "quit" {
                std::process::exit(0);
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}