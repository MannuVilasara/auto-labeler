# Auto Labeler GitHub Action

[![CI](https://github.com/MannuVilasara/auto-labeler/actions/workflows/ci.yml/badge.svg)](https://github.com/MannuVilasara/auto-labeler/actions/workflows/ci.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

Automatically label pull requests based on changed files using configurable path
patterns. :label:

This GitHub Action analyzes the files changed in a pull request and applies
labels based on a configuration file that maps labels to file path patterns.
Perfect for organizing and categorizing pull requests in large projects with
multiple teams or components.

## Features

- 🎯 **Automatic Label Assignment**: Labels PRs based on changed file paths
- ⚙️ **Configurable Path Patterns**: Use JSON configuration to define label
  mappings
- 🔄 **Smart Pattern Matching**: Supports prefix matching for flexible file
  organization
- 🚫 **Duplicate Prevention**: Automatically deduplicates labels when multiple
  patterns match
- 📝 **Comprehensive Logging**: Detailed info about applied labels and matching
  logic
- ✅ **Error Handling**: Graceful handling of missing files, invalid JSON, and
  API errors

## Quick Start

### 1. Add the Action to Your Workflow

Create or update `.github/workflows/auto-label.yml`:

```yaml
name: Auto Label PRs

on:
  pull_request:
    types: [opened, synchronize]

permissions:
  contents: read
  issues: write
  pull-requests: write

jobs:
  auto-label:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Auto Label PR
        uses: MannuVilasara/auto-labeler@v1
        with:
          token: ${{ github.token }}
          config_path: '.github/labels.json'
```

### 2. Create Your Configuration File

Create `.github/labels.json` with your label mappings:

```json
{
  "frontend": ["src/components/", "src/pages/", "public/"],
  "backend": ["src/api/", "src/services/", "server/"],
  "tests": ["__tests__/", "test/", "*.test.ts", "*.spec.ts"],
  "documentation": ["README.md", "docs/"],
  "ci/cd": [".github/", "Dockerfile"]
}
```

### 3. That's It

The action will now automatically label your pull requests based on the files
changed.

## Configuration

### Inputs

| Input         | Description                           | Required | Default               |
| ------------- | ------------------------------------- | -------- | --------------------- |
| `token`       | GitHub token for API access           | No       | `${{ github.token }}` |
| `config_path` | Path to the labels configuration file | No       | `.github/labels.json` |

### Configuration File Format

The configuration file is a JSON object where:

- **Keys** are the label names to apply
- **Values** are arrays of file path patterns to match

#### Path Matching Rules

- **Prefix Matching**: Patterns match files that start with the specified path
- **Exact Matching**: For specific files (e.g., `README.md`)
- **Directory Matching**: End patterns with `/` to match directory contents

#### Examples

```json
{
  "frontend": ["src/components/"],
  "config": ["package.json", "tsconfig.json"],
  "docs": ["docs/", "README.md"],
  "tests": ["__tests__/", "*.test.ts"]
}
```

**Note**: The action currently uses prefix matching (startsWith). So
`"*.test.ts"` will match files that start with `*.test.ts`, not files ending
with `.test.ts`. For pattern matching like file extensions, use directory-based
patterns or include the full path.

## Usage Examples

### Basic Web Project

```json
{
  "frontend": [
    "src/components/",
    "src/pages/",
    "src/styles/",
    "public/",
    "assets/"
  ],
  "backend": ["src/api/", "src/controllers/", "src/models/", "src/middleware/"],
  "database": ["migrations/", "src/database/", "prisma/"],
  "tests": ["__tests__/", "test/", "spec/"],
  "documentation": ["README.md", "docs/", "CHANGELOG.md"],
  "ci/cd": [".github/", "Dockerfile", "docker-compose.yml"],
  "dependencies": ["package.json", "package-lock.json", "yarn.lock"]
}
```

### Monorepo Project

```json
{
  "web-app": ["apps/web/"],
  "mobile-app": ["apps/mobile/"],
  "api": ["apps/api/"],
  "shared-ui": ["packages/ui/"],
  "shared-utils": ["packages/utils/"],
  "config": ["packages/config/"],
  "documentation": ["docs/", "README.md"],
  "tooling": [".github/", "scripts/"]
}
```

## How It Works

1. **Trigger**: Action runs when a pull request is opened or updated
2. **Fetch Changes**: Retrieves the list of changed files from the GitHub API
3. **Load Configuration**: Reads the label configuration from the specified JSON
   file
4. **Pattern Matching**: Compares each changed file against the configured
   patterns
5. **Apply Labels**: Adds matching labels to the pull request (deduplicates
   automatically)
6. **Report**: Logs which labels were applied and why

### Example Output

When labels are applied:

```bash
Added labels: frontend, tests, ci/cd to PR #123
```

When no patterns match:

```bash
No matching labels found for PR #123
```

## Troubleshooting

### Common Issues

#### Labels Not Applied

1. **Check Configuration File**: Ensure `.github/labels.json` exists and has
   valid JSON
2. **Verify Permissions**: The workflow needs `pull-requests: write` permission
3. **Check Path Patterns**: Remember that matching uses `startsWith()` -
   patterns should be prefixes
4. **Review Logs**: Check the action logs for error messages or debugging info

#### Configuration Errors

```json
// ❌ Invalid JSON
{
  "frontend": ["src/components/"]  // Missing comma
  "backend": ["src/api/"]
}

// ✅ Valid JSON
{
  "frontend": ["src/components/"],
  "backend": ["src/api/"]
}
```

#### Pattern Matching Issues

```json
// ❌ These won't work as expected (startsWith matching)
{
  "tests": ["**/*.test.ts", "*.spec.js"]
}

// ✅ Use directory patterns instead
{
  "tests": ["__tests__/", "test/", "src/tests/"]
}
```

## Development

This section is for contributors who want to modify or extend the action.

### Prerequisites

- Node.js 20.x or later
- npm or yarn

### Setup

1. Clone the repository

   ```bash
   git clone https://github.com/MannuVilasara/auto-labeler.git
   cd auto-labeler
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Build the action

   ```bash
   npm run bundle
   ```

4. Run tests

   ```bash
   npm test
   ```

### Project Structure

```text
src/
├── index.ts          # Entry point
├── main.ts           # Main action logic
└── ...

__tests__/
├── auto-labeler.test.ts    # Core functionality tests
├── config.test.ts          # Configuration tests
├── integration.test.ts     # Integration tests
└── README.md              # Test documentation

.github/
├── workflows/
│   └── ci.yml         # CI pipeline
└── labels.json        # Example configuration
```

### Making Changes

1. Create a new branch

   ```bash
   git checkout -b feature/your-feature
   ```

2. Make your changes in `src/`

3. Add tests in `__tests__/`

4. Run the full test suite

   ```bash
   npm run all
   ```

5. Build the distribution

   ```bash
   npm run bundle
   ```

6. Commit and push your changes

### Testing

The action includes comprehensive tests covering:

- Core labeling logic
- Configuration file validation
- Error handling scenarios
- Integration testing
- Edge cases

See [`__tests__/README.md`](./__tests__/README.md) for detailed test
documentation.

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## Support

- 📖 [Documentation](https://github.com/MannuVilasara/auto-labeler)
- 🐛 [Report Issues](https://github.com/MannuVilasara/auto-labeler/issues)
- 💬 [Discussions](https://github.com/MannuVilasara/auto-labeler/discussions)
