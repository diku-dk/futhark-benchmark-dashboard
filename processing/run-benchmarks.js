const path = require('path')
const fs = require('fs')
const execSync = require('child_process').execSync
const chalk = require('chalk')
const physicalCpuCount = require('physical-cpu-count')

if (process.argv[2] == null || process.argv[3] == null) {
  console.log("Please run: run-benchmarks.js <machine name> <input file>")
  process.exit()
}

const compilerDir = '../../futhark'
const benchmarkDir = `${compilerDir}/futhark-benchmarks`
const outDir = 'benchmark-results'
const compilerGitCommand = `git -C ${compilerDir}`
const benchmarkGitCommand = `git -C ${benchmarkDir}`
const benchmarkRuns = 10
const machine = process.argv[2]
const runs = fs.readFileSync(process.argv[3]).toString().split('\n')
const shell = (...args) => (execSync(...args) || '').toString('utf8').trim()

const compileCompiler = () => {
  console.log("Running stack setup...")
  shell(`stack setup`, {cwd: compilerDir, stdio: 'inherit'})

  console.log("Running stack clean...")
  shell(`stack clean`, {cwd: compilerDir, stdio: 'inherit'})

  console.log("Running stack build...")
  shell(`stack build --ghc-options="-j${physicalCpuCount}"`, {cwd: compilerDir, stdio: 'inherit'})
}

const runBenchmarks = (backend, compilerRevision, outputFile) => {
  try {
    shell(`stack exec -- futhark-bench --compiler=${backend} futhark-benchmarks --json ${outputFile} --runs ${benchmarkRuns}`, {cwd: compilerDir, stdio: 'inherit'})
  } catch (e) {
    console.log(chalk.red('futhark-bench reported an error - but perhaps there was none'))
  }
}

for (const run of runs) {
  // Extract backend and compiler revision from filename
  let [backend, _, compilerRevision] = run.replace('.json', '').split('-').splice(1)
  if (backend == null || compilerRevision == null) {
    console.error(`Couldn't parse run "${run}"`)
    continue
  }

  console.log(chalk.green(`\n-- Running ${compilerRevision} with ${backend}`))

  // Prepend futhark to the backend name
  backend = `futhark-${backend}`

  const outputFilename = `${backend}-${machine}-${compilerRevision}.json`
  const outputFile = `${path.resolve(__dirname,outDir)}/${outputFilename}`

  if (fs.existsSync(outputFile)) {
    console.log(chalk.green(`Build for ${compilerRevision} exists, skipping...`))
    continue
  }

  // Checkout compiler revision
  shell(`${compilerGitCommand} checkout ${compilerRevision}`)

  // Check compiler checkout success
  const compilerRevisionCheck = shell(`${compilerGitCommand} rev-parse HEAD`)
  if (compilerRevisionCheck != compilerRevision) {
    console.error(`Checkout of compiler ${compilerRevision} failed`)
    continue
  }

  // Get benchmark revision
  let benchmarkRevision = null
  try {
    shell(`${compilerGitCommand} submodule update`)
    // Get benchmark revision from submodule (preferred, newer)
    const submoduleRevision = shell(`${compilerGitCommand} submodule status | grep futhark-benchmarks`)
    console.log(`Submodule: ${submoduleRevision}`)

    benchmarkRevision = submoduleRevision.replace('-', '').replace('+', '').split(' ')[0]
  } catch (e) {
    // Get benchmark revision from date (fallback, older)
    const currentCompilerRevisionDate = shell(`${compilerGitCommand} show -s --format=%cI`)
    console.log(`Date: ${currentCompilerRevisionDate}`)

    benchmarkRevision = shell(`${benchmarkGitCommand} rev-list -1 --before="${currentCompilerRevisionDate}" master`)
  }
  console.log(chalk.yellow(`Found benchmark revision: ${benchmarkRevision}`))
  
  // Checkout benchmark revision
  shell(`${benchmarkGitCommand} checkout ${benchmarkRevision}`)

  shell(`${benchmarkGitCommand} clean -fd`)

  // Check benchmark checkout success
  const benchmarkRevisionCheck = shell(`${benchmarkGitCommand} rev-parse HEAD`)
  if (benchmarkRevisionCheck != benchmarkRevision) {
    console.error(`Checkout of benchmark ${benchmarkRevision} failed`)
    continue
  }

  // Compile compiler
  console.log(chalk.yellow(`Compiling compiler...`))
  compileCompiler()

  // Run benchmarks
  console.log(chalk.yellow(`Running benchmarks...`))
  runBenchmarks(backend, compilerRevision, outputFile)
}