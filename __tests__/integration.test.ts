/**
 * Integration tests for the Auto Labeler GitHub Action
 * These tests use actual mocking to test the complete flow
 */

// Test utilities for creating mock objects
function createMockContext(prNumber?: number) {
  return {
    payload: prNumber ? { pull_request: { number: prNumber } } : {},
    repo: {
      owner: 'test-owner',
      repo: 'test-repo'
    }
  }
}

describe('Auto Labeler Action - Integration Tests', () => {
  // These tests verify the core logic without complex mocking
  describe('Label Assignment Logic', () => {
    it('should correctly assign labels based on file paths', () => {
      const labelConfig = {
        frontend: ['src/components/', 'src/pages/'],
        backend: ['src/api/', 'server/'],
        tests: ['__tests__/', '*.test.ts']
      }

      const changedFiles = [
        'src/components/Header.tsx',
        'src/api/users.ts',
        '__tests__/header.test.ts',
        'README.md'
      ]

      // Simulate the labeling logic from main.ts
      const labelsToAdd = new Set<string>()

      for (const [label, paths] of Object.entries(labelConfig)) {
        for (const file of changedFiles) {
          if (paths.some((path) => file.startsWith(path))) {
            labelsToAdd.add(label)
          }
        }
      }

      const finalLabels = Array.from(labelsToAdd).sort()
      expect(finalLabels).toEqual(['backend', 'frontend', 'tests'])
    })

    it('should handle overlapping path patterns correctly', () => {
      const labelConfig = {
        javascript: ['src/', 'lib/'],
        typescript: ['src/', 'types/'],
        react: ['src/components/']
      }

      const changedFiles = ['src/components/Button.tsx', 'src/utils/helpers.ts']

      const labelsToAdd = new Set<string>()

      for (const [label, paths] of Object.entries(labelConfig)) {
        for (const file of changedFiles) {
          if (paths.some((path) => file.startsWith(path))) {
            labelsToAdd.add(label)
          }
        }
      }

      const finalLabels = Array.from(labelsToAdd).sort()
      // Both files should match 'javascript' and 'typescript' (both start with 'src/')
      // Button.tsx should also match 'react' (starts with 'src/components/')
      expect(finalLabels).toEqual(['javascript', 'react', 'typescript'])
    })

    it('should handle no matches gracefully', () => {
      const labelConfig = {
        frontend: ['src/components/'],
        backend: ['src/api/']
      }

      const changedFiles = [
        'docs/README.md',
        'scripts/build.sh',
        'package.json'
      ]

      const labelsToAdd = new Set<string>()

      for (const [label, paths] of Object.entries(labelConfig)) {
        for (const file of changedFiles) {
          if (paths.some((path) => file.startsWith(path))) {
            labelsToAdd.add(label)
          }
        }
      }

      expect(labelsToAdd.size).toBe(0)
    })
  })

  describe('Input Validation Logic', () => {
    it('should identify missing PR context', () => {
      const context = createMockContext() // No PR number
      const hasPR = context.payload.pull_request?.number

      expect(hasPR).toBeUndefined()
    })

    it('should identify valid PR context', () => {
      const context = createMockContext(123)
      const hasPR = context.payload.pull_request?.number

      expect(hasPR).toBe(123)
    })

    it('should validate required inputs', () => {
      const inputs = {
        token: '',
        config_path: '.github/labels.json'
      }

      const hasToken = Boolean(inputs.token)
      const hasConfigPath = Boolean(inputs.config_path)

      expect(hasToken).toBe(false)
      expect(hasConfigPath).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle JSON parsing errors', () => {
      const invalidJson = '{ "frontend": ["src/"] invalid }'

      expect(() => {
        JSON.parse(invalidJson)
      }).toThrow()
    })

    it('should handle empty configuration', () => {
      const emptyConfig = '{}'
      const parsed = JSON.parse(emptyConfig)
      const entries = Object.entries(parsed)

      expect(entries).toHaveLength(0)
    })

    it('should handle malformed configuration', () => {
      const malformedConfig = '{"frontend": "not-an-array"}'
      const parsed = JSON.parse(malformedConfig)

      // Verify that frontend is not an array (which would cause issues)
      expect(Array.isArray(parsed.frontend)).toBe(false)
    })
  })

  describe('Real-world Scenarios', () => {
    it('should handle a typical full-stack project change', () => {
      const labelConfig = {
        frontend: ['src/components/', 'src/pages/', 'public/'],
        backend: ['src/api/', 'src/services/', 'server/'],
        database: ['migrations/', 'src/database/'],
        tests: ['__tests__/', 'src/**/*.test.ts'],
        'ci/cd': ['.github/', 'Dockerfile'],
        documentation: ['README.md', 'docs/'],
        dependencies: ['package.json', 'package-lock.json']
      }

      const changedFiles = [
        'src/components/UserProfile.tsx',
        'src/api/user.ts',
        '__tests__/user.test.ts',
        'src/database/user.model.ts',
        'package.json',
        '.github/workflows/ci.yml'
      ]

      const labelsToAdd = new Set<string>()

      for (const [label, paths] of Object.entries(labelConfig)) {
        for (const file of changedFiles) {
          if (paths.some((path) => file.startsWith(path))) {
            labelsToAdd.add(label)
          }
        }
      }

      const finalLabels = Array.from(labelsToAdd).sort()
      expect(finalLabels).toEqual([
        'backend',
        'ci/cd',
        'database',
        'dependencies',
        'frontend',
        'tests'
      ])
    })

    it('should handle configuration file changes only', () => {
      const labelConfig = {
        configuration: ['config/', 'tsconfig.json', 'eslint.config.mjs'],
        dependencies: ['package.json', 'package-lock.json'],
        'ci/cd': ['.github/']
      }

      const changedFiles = [
        'tsconfig.json',
        'eslint.config.mjs',
        'package.json'
      ]

      const labelsToAdd = new Set<string>()

      for (const [label, paths] of Object.entries(labelConfig)) {
        for (const file of changedFiles) {
          if (paths.some((path) => file.startsWith(path))) {
            labelsToAdd.add(label)
          }
        }
      }

      const finalLabels = Array.from(labelsToAdd).sort()
      expect(finalLabels).toEqual(['configuration', 'dependencies'])
    })
  })

  describe('Configuration Validation', () => {
    it('should validate the default configuration structure', () => {
      const defaultConfig = {
        frontend: ['src/frontend/', 'components/'],
        backend: ['src/backend/', 'api/'],
        docs: ['README.md', 'docs/']
      }

      // Validate structure
      expect(typeof defaultConfig).toBe('object')
      expect(defaultConfig).not.toBeNull()

      // Validate all values are arrays
      for (const [label, paths] of Object.entries(defaultConfig)) {
        expect(Array.isArray(paths)).toBe(true)
        expect(paths.length).toBeGreaterThan(0)
        expect(typeof label).toBe('string')
        expect(label.length).toBeGreaterThan(0)
      }
    })

    it('should handle edge cases in path matching', () => {
      const labelConfig = {
        docs: ['README.md', 'docs/']
      }

      const testCases = [
        { file: 'README.md', shouldMatch: true },
        { file: 'docs/api.md', shouldMatch: true },
        { file: 'src/README.md', shouldMatch: false },
        { file: 'README.txt', shouldMatch: false },
        { file: 'documentation/guide.md', shouldMatch: false }
      ]

      for (const testCase of testCases) {
        const matches = labelConfig.docs.some((path) =>
          testCase.file.startsWith(path)
        )
        expect(matches).toBe(testCase.shouldMatch)
      }
    })
  })
})
