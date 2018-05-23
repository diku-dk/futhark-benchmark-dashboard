const fs = require('fs')
const glob = require('glob')
const execSync = require('child_process').execSync
const _ = require('lodash')

// Constants
const benchmarkResultsFolder = './benchmark-results'

// Gets revision hashes from an array of benchmark files
const getRevisions = (files) => {
  let revisions = files.map(file => file.replace('.json', '').split('-')[3])
  revisions = _.uniq(revisions)
  revisions = revisions.filter(revision => /^[0-9A-F]+$/i.test(revision))

  return revisions
}

// Gets commit date from one revision hash
const getRevisionDate = (revision) => {
  try {
    return execSync(`git -C ../../futhark show -s --format=%ci ${revision}`).toString('utf8').trim()
  } catch (e) {
    return null
  }
}

// If this script was executed directly
if (require.main === module) {
  // Find all benchmark files
  const files = glob.sync('*.json', {
    cwd: benchmarkResultsFolder
  })

  // Extract revision hashes
  const commits = getRevisions(files)

  // Map for output
  const commitsMap = {}

  for (const commit of commits) {
    const date = getRevisionDate(commit)

    if (date != null) {
      commitsMap[commit] = date
    }
  }

  fs.writeFileSync('./out/commits.json', JSON.stringify(commitsMap))
}

module.exports = {getRevisions, getRevisionDate}
