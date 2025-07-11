# My Tauri App

This is a Tauri application that utilizes React for the frontend and Rust for the backend. Below are the instructions for setting up and running the application.

## Prerequisites

- Node.js (version 14 or later)
- Rust (with `cargo` installed)
- Tauri CLI

## Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   cd my-tauri-app
   ```

2. Install the dependencies:

   ```
   npm install
   ```

3. Install Tauri CLI globally (if not already installed):

   ```
   cargo install tauri-cli
   ```

## Running the Application

To run the application in development mode, use the following command:

```
npm run tauri dev
```

This will start the Tauri application and open it in a new window.

## Building the Application

To build the application for production, use the following command:

```
npm run tauri build
```

This will create a distributable package of your application in the `src-tauri/target/release` directory.

## Project Structure

- `src/main.ts`: Entry point for the Tauri application.
- `src/renderer/App.tsx`: Main React component for the renderer process.
- `public/index.html`: Main HTML file for the application.
- `tauri/Cargo.toml`: Configuration file for the Rust backend.
- `tauri/src/main.rs`: Main Rust code for the Tauri application.
- `package.json`: Configuration file for npm.
- `tsconfig.json`: Configuration file for TypeScript.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.