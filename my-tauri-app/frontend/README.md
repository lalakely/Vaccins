# My Tauri App

This project is a Tauri application that wraps a web application built with modern web technologies. Below are the details and instructions for setting up and running the application.

## Project Structure

```
my-tauri-app
├── src-tauri
│   ├── Cargo.toml          # Rust package configuration
│   ├── tauri.conf.json     # Tauri application configuration
│   └── main.rs             # Main entry point for the Tauri application
├── frontend
│   ├── src                 # Source code for the frontend application
│   ├── public              # Public assets for the frontend application
│   ├── package.json        # npm configuration for the frontend
│   ├── tsconfig.json       # TypeScript configuration for the frontend
│   └── README.md           # Documentation for the frontend part of the project
└── README.md               # Documentation for the overall project
```

## Getting Started

### Prerequisites

- Node.js and npm installed
- Rust and Cargo installed
- Tauri CLI installed

### Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   cd my-tauri-app
   ```

2. Navigate to the frontend directory and install dependencies:

   ```
   cd frontend
   npm install
   ```

3. Navigate to the Tauri directory and build the Rust dependencies:

   ```
   cd ../src-tauri
   cargo build
   ```

### Running the Application

To run the application in development mode, execute the following command in the `src-tauri` directory:

```
cargo tauri dev
```

This will start the Tauri application and open the frontend in a window.

### Building for Production

To build the application for production, run:

```
cargo tauri build
```

This will create a distributable version of your application in the `src-tauri/target/release` directory.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.