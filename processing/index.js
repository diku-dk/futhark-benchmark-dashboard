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
  // Load settings
  const settings = JSON.parse(fs.readFileSync(options.settingsFile))

  // Find all files in the benchmark directory
  const benchmarkFiles = glob.sync('*.json', {
    cwd: options.benchmarkResultsDir
  })

  if (!fs.existsSync(options.outDir)) {
    fs.mkdirSync(options.outDir)
  }

  let commitData = null
  const commitsFilePath = `${options.outDir}/commits.json`
  if (!options.skipCommits) {
    // Get revision data
    commitData = getRevisionData(benchmarkFiles)

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
  const {combined, metadata} = processData({files: benchmarkFiles, commitData, benchmarkResultsFolder: options.benchmarkResultsDir, settings})

  // Write processing to disk
  fs.writeFileSync(`${options.outDir}/unoptimized.json`, JSON.stringify(combined))
  fs.writeFileSync(`${options.outDir}/metadata.json`, JSON.stringify(metadata))

  // Dashboard
  fs.writeFileSync(`${options.outDir}/dashboard.json`, JSON.stringify(dashboard(commitData, combined)))

  const splitDataDir = `${options.outDir}/data-split`
  rimraf.sync(splitDataDir)
  fs.mkdirSync(splitDataDir)

  splitData(combined, splitDataDir, '-unoptimized')

  const optimized = optimizeBenchmarks(combined, options.optimizeThreshold, commitData)
  fs.writeFileSync(`${options.outDir}/optimized.json`, JSON.stringify(optimized))
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
  .option('--skip-commits', 'Skip getting commit information')
  .option('--optimize-threshold <threshold>', 'Optimization diff threshold, defaults to 0.02', 0.02)
  .option('--benchmark-results-dir <dir>', '', './benchmark-results')
  .option('--out-dir <dir>', '', './out')
  .option('--settings-file <file>', '', './settings.json')
  .action(processDataCommand);

program
  .command('exec <cmd>')
  .alias('ex')
  .description('execute the given remote cmd')
  .option('-e, --exec_mode <mode>', 'Which exec mode to use')
  .action(function(cmd, options){
    console.log('exec \'%s\' using %s mode', cmd, options.exec_mode);
  })

if (!process.argv.slice(2).length) {
  program.outputHelp()
}


program.parse(process.argv);