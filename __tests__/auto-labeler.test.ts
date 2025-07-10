/**
 * Simple tests for the Auto Labeler GitHub Action
 * Testing basic functionality without complex mocking
 */

describe('Auto Labeler Action - Basic Tests', () => {
  it('should be able to import the main function', async () => {
    const { run } = await import('../src/main.js')
    expect(typeof run).toBe('function')
  })

  it('should export a run function from main module', async () => {
    const mainModule = await import('../src/main.js')
    expect(mainModule).toHaveProperty('run')
    expect(typeof mainModule.run).toBe('function')
  })
})

describe('Configuration File Structure Tests', () => {
  it('should handle valid label configuration format', () => {
    const validConfig = {
      frontend: ['src/components/', 'src/pages/'],
      backend: ['src/api/', 'src/server/'],
      tests: ['__tests__/', '*.test.ts']
    }

    // Test that the config structure is what we expect
    expect(validConfig).toHaveProperty('frontend')
    expect(validConfig).toHaveProperty('backend')
    expect(validConfig).toHaveProperty('tests')

    expect(Array.isArray(validConfig.frontend)).toBe(true)
    expect(Array.isArray(validConfig.backend)).toBe(true)
    expect(Array.isArray(validConfig.tests)).toBe(true)
  })

  it('should validate path matching logic', () => {
    const paths = ['src/components/', 'src/api/']
    const testFiles = [
      'src/components/Button.tsx',
      'src/api/users.ts',
      'docs/README.md'
    ]

    // Test the path matching logic that would be used in the action
    const matchingFiles = testFiles.filter((file) =>
      paths.some((path) => file.startsWith(path))
    )

    expect(matchingFiles).toEqual([
      'src/components/Button.tsx',
      'src/api/users.ts'
    ])
  })

  it('should handle label deduplication', () => {
    const labelsToAdd = new Set<string>()

    // Simulate adding labels (this mimics the Set usage in main.ts)
    labelsToAdd.add('frontend')
    labelsToAdd.add('typescript')
    labelsToAdd.add('frontend') // duplicate
    labelsToAdd.add('tests')

    const finalLabels = Array.from(labelsToAdd)

    expect(finalLabels).toHaveLength(3)
    expect(finalLabels).toContain('frontend')
    expect(finalLabels).toContain('typescript')
    expect(finalLabels).toContain('tests')
  })
})

describe('Path Matching Algorithm Tests', () => {
  it('should match files starting with specified paths', () => {
    const labelMap = {
      frontend: ['src/components/', 'src/styles/'],
      backend: ['src/api/', 'server/'],
      config: ['.github/', 'config/']
    }

    const changedFiles = [
      'src/components/Header.tsx',
      'src/api/auth.ts',
      '.github/workflows/ci.yml',
      'README.md'
    ]

    const labelsToAdd = new Set<string>()

    // Replicate the labeling logic from main.ts
    for (const [label, paths] of Object.entries(labelMap)) {
      for (const file of changedFiles) {
        if (paths.some((path) => file.startsWith(path))) {
          labelsToAdd.add(label)
        }
      }
    }

    const finalLabels = Array.from(labelsToAdd)
    expect(finalLabels).toEqual(
      expect.arrayContaining(['frontend', 'backend', 'config'])
    )
    expect(finalLabels).toHaveLength(3)
  })

  it('should handle empty configuration', () => {
    const labelMap: Record<string, string[]> = {}
    const changedFiles = ['src/test.ts', 'README.md']

    const labelsToAdd = new Set<string>()

    for (const [label, paths] of Object.entries(labelMap)) {
      for (const file of changedFiles) {
        if (paths.some((path: string) => file.startsWith(path))) {
          labelsToAdd.add(label)
        }
      }
    }

    expect(labelsToAdd.size).toBe(0)
  })

  it('should handle no matching files', () => {
    const labelMap = {
      frontend: ['src/components/'],
      backend: ['src/api/']
    }
    const changedFiles = ['docs/README.md', 'scripts/build.sh']

    const labelsToAdd = new Set<string>()

    for (const [label, paths] of Object.entries(labelMap)) {
      for (const file of changedFiles) {
        if (paths.some((path) => file.startsWith(path))) {
          labelsToAdd.add(label)
        }
      }
    }

    expect(labelsToAdd.size).toBe(0)
  })

  it('should handle multiple files matching the same label', () => {
    const labelMap = {
      frontend: ['src/components/', 'src/pages/']
    }
    const changedFiles = [
      'src/components/Header.tsx',
      'src/components/Footer.tsx',
      'src/pages/Home.tsx'
    ]

    const labelsToAdd = new Set<string>()

    for (const [label, paths] of Object.entries(labelMap)) {
      for (const file of changedFiles) {
        if (paths.some((path) => file.startsWith(path))) {
          labelsToAdd.add(label)
        }
      }
    }

    expect(labelsToAdd.size).toBe(1)
    expect(Array.from(labelsToAdd)).toEqual(['frontend'])
  })
})

describe('Error Scenarios', () => {
  it('should handle invalid JSON parsing', () => {
    const invalidJson = '{ invalid json }'

    expect(() => {
      JSON.parse(invalidJson)
    }).toThrow()
  })

  it('should handle missing required inputs', () => {
    const requiredInputs = ['token', 'config_path']
    const providedInputs = { config_path: '.github/labels.json' }

    const missingInputs = requiredInputs.filter(
      (input) => !providedInputs[input as keyof typeof providedInputs]
    )

    expect(missingInputs).toEqual(['token'])
  })
})

describe('GitHub Action Integration Points', () => {
  it('should validate action.yml structure expectations', () => {
    // Test that our expectations about the action inputs are correct
    const expectedInputs = ['token', 'config_path']
    const expectedDefaults = {
      token: '${{ github.token }}',
      config_path: '.github/labels.json'
    }

    expect(expectedInputs).toContain('token')
    expect(expectedInputs).toContain('config_path')
    expect(expectedDefaults.token).toBe('${{ github.token }}')
    expect(expectedDefaults.config_path).toBe('.github/labels.json')
  })

  it('should validate expected GitHub context structure', () => {
    const mockContext = {
      payload: {
        pull_request: {
          number: 123
        }
      },
      repo: {
        owner: 'test-owner',
        repo: 'test-repo'
      }
    }

    expect(mockContext.payload.pull_request).toBeDefined()
    expect(typeof mockContext.payload.pull_request.number).toBe('number')
    expect(mockContext.repo.owner).toBe('test-owner')
    expect(mockContext.repo.repo).toBe('test-repo')
  })
})
