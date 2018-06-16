const path = require('path')
const fs = require('fs')
const execSync = require('child_process').execSync
const chalk = require('chalk')
const physicalCpuCount = require('physical-cpu-count')

const shell = (...args) => (execSync(...args) || '').toString('utf8').trim()

const compileCompiler = (compilerDir) => {
  console.log('Running stack setup...')
  shell(`stack setup`, {cwd: compilerDir, stdio: 'inherit'})

  console.log('Running stack clean...')
  shell(`stack clean`, {cwd: compilerDir, stdio: 'inherit'})

  console.log('Running stack build...')
  shell(`stack build --ghc-options="-j${physicalCpuCount}"`, {cwd: compilerDir, stdio: 'inherit'})
}

const runFutharkBenchmarks = (backend, compilerRevision, outputFile, compilerDir, benchmarkRuns) => {
  try {
    shell(`stack exec -- futhark-bench --compiler=${backend} futhark-benchmarks --json ${outputFile} --runs ${benchmarkRuns}`, {cwd: compilerDir, stdio: 'inherit'})
  } catch (e) {
    console.log(chalk.red('futhark-bench reported an error - but perhaps there was none'))
  }
}

const rerunBenchmarks = ({machine, compilerRevisions, benchmarkRuns, outDir, compilerDir, backends}) => {
  const benchmarkDir = `${compilerDir}/futhark-benchmarks`
  const compilerGitCommand = `git -C ${compilerDir}`
  const benchmarkGitCommand = `git -C ${benchmarkDir}`

  for (const compilerRevision of compilerRevisions) {
    const hasCompiled = false

    for (let backend of backends) {
      console.log(chalk.green(`\n-- Running ${compilerRevision} with ${backend}`))

      // Prepend futhark to the backend name
      backend = `futhark-${backend}`

      const outputFilename = `${backend}-${machine}-${compilerRevision}.json`
      const outputFile = `${path.resolve(__dirname, outDir)}/${outputFilename}`

      if (fs.existsSync(outputFile)) {
        console.log(chalk.green(`Build for ${compilerRevision} exists, skipping...`))
        continue
      }

      if (!hasCompiled) {
        // Checkout compiler revision
        shell(`${compilerGitCommand} checkout ${compilerRevision}`)

        // Check compiler checkout success
        const compilerRevisionCheck = shell(`${compilerGitCommand} rev-parse HEAD`)
        if (compilerRevisionCheck !== compilerRevision) {
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
        if (benchmarkRevisionCheck !== benchmarkRevision) {
          console.error(`Checkout of benchmark ${benchmarkRevision} failed`)
          continue
        }

        // Compile compiler
        console.log(chalk.yellow(`Compiling compiler...`))
        compileCompiler(compilerDir)

        hasCompiled = true
      }

      // Run benchmarks
      console.log(chalk.yellow(`Running benchmarks...`))
      runFutharkBenchmarks(backend, compilerRevision, outputFile, compilerDir, benchmarkRuns)
    }
  }
}

module.exports = {rerunBenchmarks}
