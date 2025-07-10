# Auto Labeler Tests

This directory contains comprehensive tests for the Auto Labeler GitHub Action.
The tests are organized into three main categories for robust coverage:

## Test Files

### 1. `auto-labeler.test.ts` - Basic Functionality Tests

- **Purpose**: Tests core functionality without complex mocking
- **Coverage**:
  - Module imports and exports
  - Configuration file structure validation
  - Path matching logic
  - Label deduplication
  - Error scenarios
  - GitHub Action integration points

### 2. `integration.test.ts` - Integration Logic Tests

- **Purpose**: Tests the complete label assignment workflow
- **Coverage**:
  - Label assignment based on file paths
  - Overlapping path pattern handling
  - Input validation logic
  - Error handling for various scenarios
  - Real-world project scenarios
  - Configuration validation

### 3. `config.test.ts` - Configuration File Tests

- **Purpose**: Tests using the actual `.github/labels.json` configuration file
- **Coverage**:
  - Configuration file validation
  - Label mapping with real config
  - Project structure compatibility
  - Configuration completeness checks

## Test Strategy

The tests use a **logic-focused approach** rather than attempting to mock the
GitHub Actions environment. This approach:

- **Tests the core algorithms** that power the auto-labeler
- **Validates configuration handling** and file path matching
- **Ensures error scenarios are handled gracefully**
- **Provides confidence in the labeling logic** without complex mocking

## Key Test Scenarios

### Path Matching

Tests verify that files are correctly matched to labels based on path patterns:

```typescript
// Example: Frontend files should get 'frontend' label
const frontendFiles = ['src/components/Button.tsx', 'src/pages/Home.tsx']
const config = { frontend: ['src/components/', 'src/pages/'] }
// Result: 'frontend' label applied
```

### Label Deduplication

Tests ensure that multiple matching patterns don't create duplicate labels:

```typescript
// Example: File matches multiple patterns for same label
const file = 'src/components/Button.tsx'
const patterns = ['src/', 'src/components/'] // Both match
// Result: Only one 'frontend' label applied
```

### Error Handling

Tests cover various error scenarios:

- Invalid JSON in configuration files
- Missing required inputs (token, config_path)
- GitHub API errors
- File system errors

### Real-world Scenarios

Tests simulate realistic project changes:

- Full-stack development (frontend + backend + tests)
- Configuration-only changes
- Documentation updates
- Dependency changes

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- __tests__/auto-labeler.test.ts

# Run tests with coverage
npm run coverage
```

## Test Philosophy

These tests prioritize:

1. **Reliability**: Tests work consistently without flaky mocking
2. **Clarity**: Each test clearly shows what behavior is expected
3. **Coverage**: Tests cover the most important logic paths
4. **Maintainability**: Tests are easy to understand and modify

## Adding New Tests

When adding new tests:

1. **Follow the naming convention**: `describe` blocks should clearly indicate
   what's being tested
2. **Test behavior, not implementation**: Focus on what the code should do, not
   how it does it
3. **Use meaningful test data**: Use realistic file paths and configurations
4. **Test edge cases**: Include tests for empty inputs, invalid data, etc.

## Configuration Testing

The `config.test.ts` file is particularly important because it:

- Validates the actual configuration file used by the action
- Ensures the configuration works with real project structures
- Catches configuration errors before deployment
- Documents expected behavior through test cases

This approach ensures that the Auto Labeler Action works correctly in real
GitHub environments while maintaining a robust test suite.
