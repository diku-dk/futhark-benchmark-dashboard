var request = require('request-promise');

module.exports = getCommitDate = (commit) => {
	return new Promise((resolve, reject) => {
		request({
			uri: `https://api.github.com/repos/diku-dk/futhark/commits/${commit}`,
			json: true,
			headers: {
		    'User-Agent': 'Request-Promise'
			},
		})
		.then(commit => resolve(commit.commit.author.date))
		.catch(reject);
	});
}