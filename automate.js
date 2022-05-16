const { execSync } = require('child_process');
var readlineSync = require('readline-sync');
const open = require('open');
const chalk = require('chalk');

const run = arg => {
	try {
		return execSync(`git ${arg}`);
	} catch (err) {
		return err;
	}
};

const gitRemoteInfo = () => {
	const cmd = run('remote -v');
	const output = cmd.toString();
	const parse = output.split(' ');
	const match = /com[:\/](.+).git$/g.exec(parse[0]);
	const [userName, repoName] = match[1].split('/');
	return { userName, repoName };
};

const getActiveBranchName = () => {
	const cmd = run('branch');
	const output = cmd.toString();
	const parse = /(\*)( .+)/g.exec(output);
	const branch = parse[2];
	return branch.trim();
};

const getAllLocalBranchName = () => {
	const cmd = run('branch');
	const output = cmd.toString();
	const parse = output.split(' ');
	const branches = [];
	for (item of parse) {
		if (item === '*' || item === '') {
			continue;
		}
		const name = item.replace(/\*/g, '');
		branches.push(name.trim());
	}
	return branches;
};

const getAllRemoteBranchName = remote => {
	const cmd = run('branch -r');
	const output = cmd.toString();
	const parse = output.split(' ');
	let remoteBranches = [];
	for (item of parse) {
		if (item.includes(`${remote}/`) && !item.includes('HEAD')) {
			remoteBranches.push(item.split('/')[1].trim());
		}
	}
	return remoteBranches;
};

const getIfChanged = remote => {
	const cmd = run('status --porcelain');
	const output = cmd.toString();
	return !!output;
};

const add = () => {
	run('add -A');
};

const commit = message => {
	if (!message) {
		const answer = readlineSync.question('Type in your commit message: ');
		run(`commit -m "${answer}"`);
	} else {
		run(`commit -m "${message}"`);
	}
};

const branch = name => {
	return run(`checkout -b ${name}`);
};

const fetch = remote => {
	run(`fetch ${remote}`);
};

const pull = (remote, b_name = null) => {
	if (!b_name) {
		const branchName = getActiveBranchName();
		run(`pull ${remote} ${branchName}`);
	} else {
		run(`pull ${remote} ${b_name}`);
	}
};

const push = (remote, b_name = null) => {
	if (!b_name) {
		const branchName = getActiveBranchName();
		run(`push -u ${remote} ${branchName}`);
	} else {
		run(`push -u ${remote} ${b_name}`);
	}
};

const deleteBranch = (b_name, force) => {
	if (force) run(`branch -D ${b_name}`);
	else run(`branch -d ${b_name}`);
};

const pullRequest = (branch = null) => {
	if (!branch) branch = getActiveBranchName();
	const { userName, repoName } = gitRemoteInfo();
	url = `https://github.com/${userName}/${repoName}/pull/new/${branch}`;
	if (branch !== 'master' && branch !== 'main') {
		open(url);
	} else {
		console.log(
			chalk.bgRed
				.hex('#000')
				.bold(` You are currently in ${branch} branch ! `)
		);
	}
};

const pruneRemote = (force = false, remote) => {
	localBranches = getAllLocalBranchName();

	const cmd = run(`remote prune ${remote}`);
	const output = cmd.toString();
	if (!cmd.toString()) {
		console.log(
			chalk
				.bgHex('#36bb09')
				.hex('#000')
				.bold(' You are all Synced with remote! ')
		);
		return;
	}
	const parse = output.split(' ');
	for (pruned of parse) {
		if (pruned.includes(`${remote}/`)) {
			const [origin, branch] = pruned.split('/');
			const b_trimmed = branch.trim();
			if (localBranches.includes(b_trimmed)) {
				console.log(`Deleted Branch : ${b_trimmed}`);
				deleteBranch(b_trimmed);
			}
		}
	}
};

const pruneLocal = async (force = false, remote) => {
	localBranches = getAllLocalBranchName();
	remoteBranches = getAllRemoteBranchName(remote);
	let dirty = false;
	for (br of localBranches) {
		if (!remoteBranches.includes(br)) {
			dirty = true;
			console.log(`Deleted Branch: ${br}`);
			deleteBranch(br);
		}
	}
	!dirty &&
		console.log(
			chalk.bgHex('#36bb09').hex('#000').bold(' You are all Synced! ')
		);
};

const sync = remote => {
	fetch(remote);
	pull(remote);
};
const newBranchPushPR = remote => {
	const b_name = readlineSync.question(
		'Type in the name of the branch you want to make: '
	);
	branch(b_name);
	if (getIfChanged()) {
		add();
		commit();
	}
	push(remote);
	pullRequest(b_name);
};
const normalPush = (remote, b_name = null) => {
	if (getIfChanged()) {
		add();
		commit();
	}
	push(remote, b_name);
};

module.exports = {
	pruneRemote,
	newBranchPushPR,
	pruneLocal,
	normalPush,
	pullRequest
};
