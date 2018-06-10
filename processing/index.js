const fs = require('fs')
const glob = require('glob')
const rimraf = require('rimraf')
const program = require('commander')
const { getRevisionData } = require('./find-commit-dates.js')
const { processData } = require('./process-data.js')
const { dashboard } = require('./dashboard.js')
const { splitData } = require('./split-data.js')
const { optimizeBenchmarks } = require('./optimize-data.js')

const processDataCommand = (options) => {
  // Load settings
  const settings = JSON.parse(fs.readFileSync(options.parent.settingsFile))

  // Find all files in the benchmark directory
  const benchmarkFiles = glob.sync('*.json', {
    cwd: options.parent.benchmarkResultsDir
  })

  if (!fs.existsSync(options.parent.outDir)) {
    fs.mkdirSync(options.parent.outDir)
  }

  let commitData = null
  const commitsFilePath = `${options.parent.outDir}/commits.json`
  if (!options.parent.skipCommits) {
    // Get revision data
    commitData = getRevisionData(benchmarkFiles, '../../futhark')

    // Write commits to disk
    fs.writeFileSync(commitsFilePath, JSON.stringify(commitData))
  } else {
    if (fs.existsSync(commitsFilePath)) {
      commitData = JSON.parse(fs.readFileSync(commitsFilePath))
    } else {
      console.error('No commits file was found, couldn\'t --skip-commits')
      return
    }
  }

  // Process all the benchmark files
  const {combined, metadata} = processData({files: benchmarkFiles, commitData, benchmarkResultsFolder: options.parent.benchmarkResultsDir, settings})

  // Write processing to disk
  fs.writeFileSync(`${options.parent.outDir}/unoptimized.json`, JSON.stringify(combined))
  fs.writeFileSync(`${options.parent.outDir}/metadata.json`, JSON.stringify(metadata))

  // Dashboard
  fs.writeFileSync(`${options.parent.outDir}/dashboard.json`, JSON.stringify(dashboard(commitData, combined)))

  const splitDataDir = `${options.parent.outDir}/data-split`
  rimraf.sync(splitDataDir)
  fs.mkdirSync(splitDataDir)

  splitData(combined, splitDataDir, '-unoptimized')

  const optimized = optimizeBenchmarks(combined, options.optimizeThreshold, commitData)
  fs.writeFileSync(`${options.parent.outDir}/optimized.json`, JSON.stringify(optimized))
  splitData(optimized, splitDataDir, '-optimized')
}

program
  .version('0.1.0')
  .option('--skip-commits', 'Skip getting commit information')
  .option('--benchmark-results-dir <dir>', '', './benchmark-results')
  .option('--out-dir <dir>', '', './out')
  .option('--settings-file <file>', '', './settings.json')

program
  .command('process')
  .description('process futhark-benchmark data')
  .option('--optimize-threshold <threshold>', 'Optimization diff threshold', 0.02)
  .action(processDataCommand)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}

program.parse(process.argv)
