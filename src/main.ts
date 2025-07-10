import * as core from '@actions/core'
import * as github from '@actions/github'
import * as fs from 'fs'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    // Get the input value from the action
    const token = core.getInput('token')
    const configPath = core.getInput('config_path')
    const octokit = github.getOctokit(token)

    const context = github.context
    const prNumber = context.payload.pull_request?.number

    if (!prNumber) {
      core.setFailed('No PR number found.')
      return
    }

    const owner = context.repo.owner
    const repo = context.repo.repo

    // Check if the token is provided
    if (!token) {
      throw new Error('Token is required but not provided.')
    }
    // Check if the config path is provided
    if (!configPath) {
      throw new Error('Config path is required but not provided.')
    }
    // Check if the config file exists
    if (!fs.existsSync(configPath)) {
      throw new Error(`Config file not found at path: ${configPath}`)
    }
    // Read the configuration file
    const configContent = fs.readFileSync(configPath, 'utf8')

    const labelMap: Record<string, string[]> = JSON.parse(configContent)

    const files = await octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber
    })

    const changedFiles = files.data.map((f) => f.filename)
    const labelsToAdd = new Set<string>()

    for (const [label, path] of Object.entries(labelMap)) {
      for (const file of changedFiles) {
        if (path.some((p) => file.startsWith(p))) {
          labelsToAdd.add(label)
        }
      }
    }

    if (labelsToAdd.size > 0) {
      await octokit.rest.issues.addLabels({
        owner,
        repo,
        issue_number: prNumber,
        labels: Array.from(labelsToAdd)
      })
      core.info(
        `Added labels: ${Array.from(labelsToAdd).join(', ')} to PR #${prNumber}`
      )
    } else {
      core.info(`No matching labels found for PR #${prNumber}`)
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
