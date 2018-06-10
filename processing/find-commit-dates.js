const fs = require('fs')
const glob = require('glob')
const {execSync} = require('child_process')
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
    return new Date(
      execSync(`git -C ../../futhark show -s --format=%ci ${revision}`).toString('utf8').trim()
    ).toISOString()
  } catch (e) {
    return null
  }
}

// Gets commit message from one revision hash
const getRevisionMessage = (revision) => {
  try {
    return execSync(`git -C ../../futhark show -s --format=%s ${revision}`).toString('utf8').trim()
  } catch (e) {
    return null
  }
}

const getRevisionData = (files) => {
  // Extract revision hashes
  const commits = getRevisions(files)

  // Map for output
  const commitsMap = {}

  for (const commit of commits) {
    const date = getRevisionDate(commit)
    const message = getRevisionMessage(commit)

    if (date != null) {
      commitsMap[commit] = {
        date,
        message
      }
    }
  }

  return commitsMap
}

module.exports = {getRevisions, getRevisionDate, getRevisionMessage, getRevisionData}
