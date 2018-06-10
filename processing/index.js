const fs = require('fs')
const glob = require('glob')
const rimraf = require('rimraf')
const program = require('commander')
const { getRevisionData } = require('./find-commit-dates.js');
const { processData } = require('./process-data.js');
const { dashboard } = require('./dashboard.js');
const { splitData } = require('./split-data.js');
const { optimizeBenchmarks } = require('./optimize-data.js');

processDataCommand = (options) => {
  // Directory containing all .json benchmark files
  const benchmarkResultsFolder = './benchmark-results'
  const outDir = './out'
  const settingsFile = './settings.json'

  // Load settings
  const settings = JSON.parse(fs.readFileSync(settingsFile))

  // Find all files in the benchmark directory
  const benchmarkFiles = glob.sync('*.json', {
    cwd: benchmarkResultsFolder
  })

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir)
  }

  let commitData = null
  const commitsFilePath = `${outDir}/commits.json`
  if (!options.skipCommits) {
    // Get revision data
    commitData = getRevisionData(benchmarkFiles)

    // Write commits to disk
    fs.writeFileSync(commitsFilePath, JSON.stringify(commitData))
  } else {
    if (fs.existsSync(commitsFilePath)) {
      commitData = JSON.parse(fs.readFileSync(commitsFilePath))
    } else {
      console.error("No commits file was found, couldn't --skip-commits")
      return
    }
  }

  // Process all the benchmark files
  const {combined, metadata} = processData({files: benchmarkFiles, commitData, benchmarkResultsFolder, settings})

  // Write processing to disk
  fs.writeFileSync(`${outDir}/unoptimized.json`, JSON.stringify(combined))
  fs.writeFileSync(`${outDir}/metadata.json`, JSON.stringify(metadata))

  // Dashboard
  fs.writeFileSync(`${outDir}/dashboard.json`, JSON.stringify(dashboard(commitData, combined)))

  const splitDataDir = `${outDir}/data-split`
  rimraf.sync(splitDataDir)
  fs.mkdirSync(splitDataDir)

  splitData(combined, splitDataDir, '-unoptimized')

  const optimized = optimizeBenchmarks(combined, 0.02, commitData)
  fs.writeFileSync(`${outDir}/optimized.json`, JSON.stringify(optimized))
  splitData(optimized, splitDataDir, '-optimized')
}

program
  .version('0.1.0')
  .option('-C, --chdir <path>', 'change the working directory')
  .option('-c, --config <path>', 'set config path. defaults to ./deploy.conf')
  .option('-T, --no-tests', 'ignore test hook');

program
  .command('process')
  .description('process futhark-benchmark data')
  .option("--skip-commits", "Skip getting commit information")
  .action(processDataCommand);

program
  .command('exec <cmd>')
  .alias('ex')
  .description('execute the given remote cmd')
  .option("-e, --exec_mode <mode>", "Which exec mode to use")
  .action(function(cmd, options){
    console.log('exec "%s" using %s mode', cmd, options.exec_mode);
  })

program.parse(process.argv);