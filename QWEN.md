# SuccessFuel ERP - QWEN Context

## Project Overview

SuccessFuel ERP is a cloud-first enterprise resource planning system built with Tauri and Svelte. It's designed as a modern ERP solution with a secure desktop client that provides enhanced functionality and offline capabilities for gas station management and other business operations.

The project follows a plugin architecture (referred to as "bricks") that allows for modular feature extensions, making it highly customizable and extensible. The architecture combines a cloud-based backend with a Tauri-based desktop application for enhanced functionality.

## Technologies Used

- **Frontend Framework**: SvelteKit 2.x with Svelte 5.x
- **Language**: TypeScript 5.6.x
- **Desktop Framework**: Tauri 2.x (Rust-based)
- **Build Tool**: Vite 6.x
- **Internationalization**: svelte-i18n 4.x
- **UI Components**: Custom component library with reusable UI elements
- **State Management**: Svelte stores

## Project Structure

```
SuccessFuel/
├── src/                         # Frontend source code
│   ├── app.html                 # HTML template
│   ├── lib/                     # Shared libraries
│   │   ├── components/          # Svelte components (ui, bricks, shared, features)
│   │   ├── stores/              # Global state stores
│   │   ├── utils/               # Utility functions
│   │   ├── i18n/                # Internationalization
│   │   ├── types/               # Type definitions
│   │   └── services/            # Service layer (API, business logic)
│   ├── routes/                  # SvelteKit routes
│   ├── assets/                  # Static assets
│   └── styles/                  # CSS styles
├── src-tauri/                   # Tauri desktop application
│   ├── src/                     # Rust source code
│   ├── Cargo.toml               # Rust dependencies
│   └── tauri.conf.json          # Tauri configuration
├── static/                      # Static files
├── package.json                 # Node.js dependencies
├── svelte.config.js             # SvelteKit configuration
└── vite.config.js               # Vite configuration
```

## Key Features

### Plugin System (Bricks)
- Modular architecture allowing dynamic feature extensions
- Plugin lifecycle management with load/unload capabilities
- Permission and security checks
- Dynamic import of plugin components
- Plugin manifest system for configuration

### Internationalization (i18n)
- Multi-language support using svelte-i18n
- Structured locale files organized by language
- Plugin-specific translation loading

### Cloud-First Design
- API service layer for cloud integration
- JWT-based authentication system
- Secure communication with cloud services
- State management for offline capabilities

### Secure Desktop Deployment
- Tauri-based desktop application with security-first approach
- Content Security Policy (CSP) implementation
- Secure IPC communication
- Auto-update capabilities

## Building and Running

### Development Mode
```bash
# Run in development mode (Tauri)
npm run tauri dev

# Or run web version only
npm run dev
```

### Production Build
```bash
# Build for production (Tauri app)
npm run tauri build

# Build static web version
npm run build
```

### Other Commands
```bash
# Type checking
npm run check

# Type checking with watch
npm run check:watch

# Preview production build
npm run preview

# Run linting and formatting
npm run lint

# Extract i18n strings
npm run i18n
```

## Development Conventions

### File Naming and Structure
- Use kebab-case for file names
- Use PascalCase for Svelte component names
- Organize files by feature/components
- Use TypeScript for all business logic files

### Code Organization
- Follow SvelteKit file-based routing
- Use `$lib` alias for files in src/lib/
- Component aliases defined in svelte.config.js:
  - `$components` → src/lib/components
  - `$stores` → src/lib/stores
  - `$utils` → src/lib/utils
  - `$types` → src/lib/types
  - `$services` → src/lib/services
  - `$i18n` → src/lib/i18n
  - `$plugins` → src/lib/components/bricks

### Component Structure
- UI components in `src/lib/components/ui/`
- Plugin system components in `src/lib/components/bricks/`
- Shared layout components in `src/lib/components/shared/`
- Feature-specific components in `src/lib/components/features/`

### State Management
- Use Svelte stores for global state management
- Define types in `src/lib/types/`
- Keep stores organized by domain (auth.ts, user.ts, etc.)

### Internationalization
- Place translation files in `src/lib/i18n/locales/`
- Use English as the default language
- Organize translations by context (common.json, navigation.json, etc.)

### Security Considerations
- All API communications should use HTTPS
- Implement proper authentication checks
- Sanitize all user inputs
- Follow Tauri security best practices
- Use CSP policies for content security

## Testing Strategy

The project doesn't have explicit test configuration visible in the checked files, but recommended testing approaches include:

- Unit tests for utility functions and services
- Component tests for Svelte components
- Integration tests for API services
- End-to-end tests for critical user flows

## Architecture Notes

- The system follows a cloud-first principle with desktop capabilities for enhanced UX
- Plugin system allows for modular feature additions without core system modifications
- State management is centralized using Svelte stores
- API services are abstracted to allow for both cloud and potential offline data synchronization
- Internationalization is built-in from the start to support multi-language deployments
- Security is implemented at multiple levels (frontend, desktop, API)

## Common Tasks

### Adding a New Route
1. Create a new file in `src/routes/` following SvelteKit routing conventions
2. Use `+page.svelte` for pages and `+layout.svelte` for layouts
3. Add necessary authentication checks if required

### Creating a New Component
1. Create in the appropriate subdirectory in `src/lib/components/`
2. Use descriptive naming following PascalCase
3. Add proper TypeScript types if needed
4. Export the component in index files if it's meant to be shared

### Adding a New Plugin (Brick)
1. Create a plugin directory in `src/lib/components/bricks/`
2. Include necessary files (index.ts, Component.svelte, types.ts, manifest.json)
3. Follow the plugin manifest format defined in ARCHITECTURE.md
4. Register the plugin with the plugin system

### Internationalization
1. Add translation keys to the appropriate locale files
2. Use the `$i18n` alias to import translation functions
3. Implement dynamic language switching where needed

## Qwen Added Memories
- Analyzed the SuccessFuel ERP application architecture and provided a comprehensive assessment of moving API calls from frontend (TypeScript) to backend (Rust/Tauri). Key findings include: moderate technical complexity (12-18 hours for basic implementation), significant security benefits (credential protection, request interception prevention), and performance considerations (minimal overhead with potential for caching improvements). The current architecture already has Tauri commands for auth and plugins, making the migration feasible.
