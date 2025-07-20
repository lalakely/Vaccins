// Déclaration des types pour l'API Tauri
interface TauriEvent {
  listen(event: string, callback: (payload: any) => void): () => void;
  emit(event: string, payload?: any): void;
}

interface Tauri {
  event: TauriEvent;
  invoke(cmd: string, args?: any): Promise<any>;
  // Ajoutez d'autres API Tauri au besoin
}

interface Window {
  __TAURI__?: Tauri;
}
