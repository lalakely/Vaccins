use std::process::Command;
use std::thread;
use std::path::PathBuf;
use tauri::Manager;
use tauri::Emitter;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      let app_handle = app.handle().clone();
      
      // Démarrer le serveur backend dans un thread séparé
      thread::spawn(move || {
        let backend_path = PathBuf::from("../backend");
        
        println!("Démarrage du serveur backend...");
        
        #[cfg(target_os = "windows")]
        let mut command = Command::new("cmd");
        #[cfg(target_os = "windows")]
        command.args(["/c", "npm", "run", "start"]);
        
        #[cfg(not(target_os = "windows"))]
        let mut command = Command::new("npm");
        #[cfg(not(target_os = "windows"))]
        command.args(["run", "start"]);
        
        command.current_dir(&backend_path);
        
        match command.spawn() {
          Ok(_) => println!("Serveur backend démarré avec succès"),
          Err(e) => {
            eprintln!("Erreur lors du démarrage du serveur backend: {}", e);
            // Émettre un événement pour informer le frontend
            let _ = app_handle.emit("backend-error", format!("Erreur de démarrage: {}", e));
          }
        }
      });
      
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      
      Ok(())
    })
    .plugin(tauri_plugin_shell::init())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
