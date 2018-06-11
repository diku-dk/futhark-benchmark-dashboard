const fs = require('fs')
const glob = require('glob')
const rimraf = require('rimraf')
const program = require('commander')
const { getAllRevisionData } = require('./modules/find-commit-dates.js')
const { processData } = require('./modules/process-data.js')
const { dashboard } = require('./modules/dashboard.js')
const { splitData } = require('./modules/split-data.js')
const { optimizeBenchmarks } = require('./modules/optimize-data.js')

const processDataCommand = (options) => {
  const {
    outDir,
    futharkGitDir,
    skipCommits,
    benchmarkResultsDir,
    settingsFile
  } = options.parent

  const {
    optimizeThreshold
  } = options

  // Load settings
  const settings = JSON.parse(fs.readFileSync(settingsFile))

  // Find all files in the benchmark directory
  const benchmarkFiles = glob.sync('*.json', {
    cwd: benchmarkResultsDir
  })

  // Ensure that outdir exists
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir)
  }

  // Either generate list of commits or load from file
  let commitData = null
  const commitsFilePath = `${outDir}/commits.json`
  if (!skipCommits) {
    // Get revision data
    commitData = getAllRevisionData(benchmarkFiles, futharkGitDir)

    // Write commits to disk
    fs.writeFileSync(commitsFilePath, JSON.stringify(commitData))
  } else {
    // Load commits from file
    if (fs.existsSync(commitsFilePath)) {
      commitData = JSON.parse(fs.readFileSync(commitsFilePath))
    } else {
      console.error('No commits file was found, couldn\'t --skip-commits')
      return
    }
  }

  // Process all the benchmark files
  const {combined, metadata} = processData({files: benchmarkFiles, commitData, benchmarkResultsFolder: benchmarkResultsDir, settings})

  // Write processing to disk
  fs.writeFileSync(`${outDir}/unoptimized.json`, JSON.stringify(combined))
  fs.writeFileSync(`${outDir}/metadata.json`, JSON.stringify(metadata))

  // Dashboard
  fs.writeFileSync(`${outDir}/dashboard.json`, JSON.stringify(dashboard(commitData, combined)))

  // Ensure 'data-split' directory
  const splitDataDir = `${outDir}/data-split`
  rimraf.sync(splitDataDir)
  fs.mkdirSync(splitDataDir)

  // Split unoptimized data
  splitData(combined, splitDataDir, '-unoptimized')

  // Optimize data
  const optimized = optimizeBenchmarks(combined, optimizeThreshold, commitData)
  fs.writeFileSync(`${outDir}/optimized.json`, JSON.stringify(optimized))

  // Split optimized data
  splitData(optimized, splitDataDir, '-optimized')
}

program
  .version('0.1.0')
  .option('--skip-commits', 'Skip getting commit information')
  .option('--benchmark-results-dir <dir>', '', './benchmark-results')
  .option('--out-dir <dir>', '', './out')
  .option('--settings-file <file>', '', './settings.json')
  .option('--futhark-git-dir <dir>', '', '../../futhark')

program
  .command('process')
  .description('process futhark-benchmark data')
  .option('--optimize-threshold <threshold>', 'Optimization diff threshold', 0.02)
  .action(processDataCommand)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}

program.parse(process.argv)
