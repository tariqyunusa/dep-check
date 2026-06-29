# tidy-deps

A CLI tool to detect unused dependencies, audit package health, and keep your `node_modules` clean.

```bash
npx tidy-deps
```

---

## Features

- Detects unused dependencies across `dependencies` and `devDependencies`
- Selective removal — choose which packages to remove individually
- Supports `npm`, `yarn`, `pnpm`, and `bun`
- Audit mode with package health checks
- Zero config — works out of the box in any Node.js project

---

## Usage

### Detect unused dependencies

```bash
npx tidy-deps
```

```
Detected package manager: npm

Found 3 unused dependencies:

  · @yarnpkg/lockfile
  · chalk
  · yaml

Enter numbers to remove (e.g. 1,3) or "all" or "none":
```

### Run on a specific project

```bash
npx tidy-deps ./my-project
```

### Skip the removal prompt

```bash
npx tidy-deps --no-remove
```

---

## Audit Mode

Run a full health check on your dependencies:

```bash
npx tidy-deps --audit
```

```
🔍 Running audit...

✔ [████████████████████] 100% — done

┌─ Outdated ─────────────────────────────────────────────┐
│  MAJOR    commander            ^12.1.0 → 15.0.0        │
│  MINOR    chalk                ^5.0.0  → 5.6.2         │
└────────────────────────────────────────────────────────┘

┌─ Summary ──────────────────────────────────────────────┐
│  5 errors · 3 warnings · 0 info                        │
└────────────────────────────────────────────────────────┘
```

Audit checks include:

- **Outdated** — detects patch, minor, and major updates available on npm
- **Deprecated** — flags packages marked deprecated by their authors
- **Licenses** — surfaces risky copyleft licenses (GPL, AGPL, LGPL)
- **Lockfile** — checks your lockfile is in sync with `package.json`

---

## Options

| Flag | Description |
|------|-------------|
| `[path]` | Path to project (defaults to current directory) |
| `--audit` | Run dependency health checks |
| `--no-remove` | Skip the removal prompt |
| `--version` | Show version number |
| `--help` | Show help |

---

## Requirements

Node.js >= 16

---

## License

MIT © 2026 Tariq Yunusa