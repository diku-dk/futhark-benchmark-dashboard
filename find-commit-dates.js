const fs = require('fs');
const glob = require("glob")
const execSync = require('child_process').execSync;
const exec = require('child_process').exec;
var PromisePool = require('es6-promise-pool')

const benchmarkResultsFolder = './benchmark-results'

const files = glob.sync("*.json", {
  cwd: benchmarkResultsFolder
})

const commits = uniq(files.map(file => file.replace('.json', '').split('-')[3]))

const commitsMap = {}

// Create a pool. 
var pool = new PromisePool(() => commits.map(commit => {
  return new Promise((resolve, reject) => {
    exec(`git -C ../futhark show -s --format=%cI ${commit}`, (error, stdout, stderr) => {
      console.log(commit, error, stdout, stderr)
      if (stderr == "") {
        console.log(commit, stdout)
        commitsMap[commit] = stdout.trim()
      }
      resolve()
    })
  })
}), 3)

// Start the pool. 
var poolPromise = pool.start()

poolPromise.then(function () {
  fs.writeFileSync('./commits.json', JSON.stringify(commitsMap));
})

/*Promise.all().then(() => {
  
})*/

function uniq(a) {
    var prims = {"boolean":{}, "number":{}, "string":{}}, objs = [];

    return a.filter(function(item) {
        var type = typeof item;
        if(type in prims)
            return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
        else
            return objs.indexOf(item) >= 0 ? false : objs.push(item);
    });
}