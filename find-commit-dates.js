const fs = require('fs');
const glob = require("glob")
const execSync = require('child_process').execSync;

const benchmarkResultsFolder = './benchmark-results'

const files = glob.sync("*.json", {
  cwd: benchmarkResultsFolder
})

const commits = uniq(files.map(file => file.replace('.json', '').split('-')[3]))

const commitsMap = {}

for (commit of commits) {
	//console.log(commit)
	try {
		commitsMap[commit] = execSync(`git -C ../futhark show -s --format=%cI ${commit}`).toString('utf8').trim()
	} catch (e) {
		//console.error(`Bad commit hash: ${commit}`)
	}
}

fs.writeFileSync('./commits.json', JSON.stringify(commitsMap));

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