# tidy-deps

Easily detect and remove unused npm dependencies in your project.

##  Features
- Scan your `package.json` for unused dependencies
- Interactive prompts before deleting
- Automatically uninstall unused packages
- Supports both `dependencies` and `devDependencies`

---

##  Installation

### 1. Install globally
```bash
npm install -g tidy-deps
```
### 2. Navigate to your project
```bash
cd my-project
```

### 3. Run tidy-deps
```bash
tidy-deps
```

## Usage
Simply run the command inside any Node.js project:
```bash
tidy-deps
```

### Example output:
```bash
? Unused dependency found: chalk
  Do you want to remove it? (y/N) y
✔ chalk removed successfully

? Unused dependency found: lodash
  Do you want to remove it? (y/N) n
✖ lodash kept
```

## Requirements
Node.js >= 14

