const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const glob = require('glob')
const rimraf = require('rimraf')
const program = require('commander')
const { getAllRevisionData } = require('./modules/find-commit-dates.js')
const { processData } = require('./modules/process-data.js')
const { dashboard } = require('./modules/dashboard.js')
const { splitData } = require('./modules/split-data.js')
const { optimizeBenchmarks } = require('./modules/optimize-data.js')
const { saveFileAndCompress } = require('./modules/lib.js')
const { rerunBenchmarks } = require('./modules/rerun-benchmarks.js')
const { prioritize } = require('./modules/prioritize-commits.js')

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
    saveFileAndCompress(commitsFilePath, JSON.stringify(commitData))
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
  // saveFileAndCompress(`${outDir}/unoptimized.json`, JSON.stringify(combined)) // Too slow
  saveFileAndCompress(`${outDir}/metadata.json`, JSON.stringify(metadata))

  // Dashboard
  saveFileAndCompress(`${outDir}/dashboard.json`, JSON.stringify(dashboard(commitData, combined)))

  // Ensure 'data-split' directory
  const splitDataDir = `${outDir}/data-split`
  rimraf.sync(splitDataDir)
  fs.mkdirSync(splitDataDir)

  // Split unoptimized data
  splitData(combined, splitDataDir, '-unoptimized')

  // Optimize data
  const optimized = optimizeBenchmarks(combined, optimizeThreshold, commitData)
  saveFileAndCompress(`${outDir}/optimized.json`, JSON.stringify(optimized))

  // Split optimized data
  splitData(optimized, splitDataDir, '-optimized')
}

const rerunBenchmarksCommand = (machineName, options) => {
  const {
    outDir,
    futharkGitDir,
    benchmarkResultsDir
  } = options.parent

  const {
    benchmarkRuns,
    commitCount,
    backends
  } = options

  if (machineName == null || machineName === '') {
    throw Error('No machine name for this machine was provided')
  }

  let unoptimized = JSON.parse(fs.readFileSync(`${outDir}/unoptimized.json`))
  const commits = JSON.parse(fs.readFileSync(`${outDir}/commits.json`))

  unoptimized = _.pickBy(unoptimized, (_, backend) => backends.includes(backend))

  const compilerRevisions = prioritize(unoptimized, commits, {maxRevisions: commitCount || Infinity})

  rerunBenchmarks({
    compilerDir: futharkGitDir,
    benchmarkRuns,
    machine: machineName,
    outDir: path.resolve(__dirname, benchmarkResultsDir),
    compilerRevisions,
    backends
  })
}

const list = val => val.split(',')

program
  .version('0.1.0')
  .option('--skip-commits', 'skip getting commit information')
  .option('--benchmark-results-dir <dir>', '', './benchmark-results')
  .option('--out-dir <dir>', '', './out')
  .option('--settings-file <file>', '', './settings.json')
  .option('--futhark-git-dir <dir>', '', '../../futhark')

program
  .command('process')
  .description('process futhark-benchmark data')
  .option('--optimize-threshold <threshold>', 'optimization diff threshold', 0.02)
  .action(processDataCommand)

program
  .command('rerun <machine-name>')
  .description('rerun futhark benchmarks on this machine')
  .option('--commit-count <n>', 'n amount of commits to be benchmarked', 100)
  .option('--benchmark-runs <n>', 'n amount of benchmark iterations, for futhark-bench', 10)
  .option('--backends <backends>', 'backends to run with futhark-bench', list, ['opencl', 'pyopencl'])
  .action(rerunBenchmarksCommand)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}

program.parse(process.argv)
