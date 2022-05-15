const { execSync } = require('child_process');
var readlineSync = require('readline-sync');
const open = require('open');

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
	const parse = /(\*)( [\w]+)/g.exec(output);
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
		branches.push(item.trim());
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

const pruneRemote = async (force = false, remote) => {
	fetch(remote);
	localBranches = await getAllLocalBranchName();

	const cmd = run(`remote prune ${remote}`);
	console.log(cmd.stdout);
	cmd.stdout.on('data', output => {
		const parse = output.split(' ');
		for (pruned of parse) {
			if (pruned.includes(`${remote}/`)) {
				const { origin, branch } = pruned.split('/');
				if (localBranches.includes(branch)) {
					console.log(`Deleted Branch : ${branch}`);
					deleteBranch(branch);
				}
			}
		}
	});
};

const pruneLocal = async (force = false, remote) => {
	fetch(remote);
	localBranches = getAllLocalBranchName();
	run(`remote prune ${remote}`);
	remoteBranches = getAllRemoteBranchName(remote);
	for (br of localBranches) {
		if (!remoteBranches.includes(br)) {
			console.log(`Deleted Branch: ${br}`);
			deleteBranch(br);
		}
	}
};

const sync = remote => {
	fetch(remote);
	pull(remote);
};
const justNewBranchPushPR = remote => {
	const { userName, repoName } = gitRemoteInfo();
	const b_name = readlineSync.question(
		'Type in the name of the branch you want to make: '
	);
	url = `https://github.com/${userName}/${repoName}/pull/new/${b_name}`;
	branch(b_name);
	push(remote, b_name);
	open(url);
};
const newBranchPushPR = remote => {
	const { userName, repoName } = gitRemoteInfo();
	const b_name = readlineSync.question(
		'Type in the name of the branch you want to make: '
	);
	url = `https://github.com/${userName}/${repoName}/pull/new/${b_name}`;
	if (getIfChanged()) {
		add();
		commit();
	}
	branch(b_name);
	push(remote, b_name);
	open(url);
};
const normalPushPR = remote => {
	b_name = getActiveBranchName();
	const { userName, repoName } = gitRemoteInfo();
	url = `https://github.com/${userName}/${repoName}/pull/new/${b_name}`;
	add();
	commit();
	push(remote, b_name);
	if (b_name !== 'master' || b_name !== 'main') {
		open(url);
	}
};
const justPullRequest = remote => {
	b_name = getActiveBranchName();
	const { userName, repoName } = gitRemoteInfo();
	url = `https://github.com/${userName}/${repoName}/pull/new/${b_name}`;
	push(remote, b_name);
	if (b_name !== 'master' || b_name !== 'main') {
		open(url);
	}
};
const normalPush = (remote, b_name = null) => {
	add();
	commit();
	push(remote, b_name);
};
// push('origin')
// justNewBranchPushPR('origin');
// pruneLocal(false, 'origin')
// newBranchPushPR('origin')
// normalPushPR("origin")
getIfChanged('origin');
module.exports = { pruneRemote, newBranchPushPR };
