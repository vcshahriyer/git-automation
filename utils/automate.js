const { execSync, spawn } = require('child_process');
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
const asyncRun = arg => {
	return new Promise((resolve, reject) => {
		try {
			const exc = spawn(`git ${arg}`, { shell: true });
			exc.stdout.on('data', data => {
				console.log(data.toString());
			});
			exc.on('error', code => {
				console.log(
					chalk.bgRedBright.hex('#000').bold(`Error: ${code}`)
				);
			});
			exc.stderr.on('data', err => {
				console.log(chalk.underline.bold(`${err}`));
			});
			exc.on('exit', code => {
				resolve(true);
			});
		} catch (err) {
			reject(err);
		}
	});
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

const getIfChanged = () => {
	const cmd = run('status --porcelain');
	const output = cmd.toString();
	return !!output;
};

const add = () => {
	run('add -A');
};

const commit = async message => {
	return new Promise(async (resolve, _) => {
		if (!message)
			message = readlineSync.question('Type in your commit message: ');
		await asyncRun(`commit -m "${message}"`);
		return resolve(true);
	});
};

const branch = name => {
	return run(`checkout -b ${name}`);
};

const checkout = branch => {
	if (!branch) {
		console.log(
			chalk.bgRedBright.hex('#000').bold(` No branch name provided ! `)
		);
		return;
	}
	run(`checkout ${branch}`);
};

const pull = async (remote, branchName = null) => {
	return new Promise(async (resolve, _) => {
		if (!branchName) branchName = getActiveBranchName();
		await asyncRun(`pull ${remote} ${branchName}`);
		return resolve(true);
	});
};

const push = async (remote, branchName = null) => {
	if (!branchName) branchName = getActiveBranchName();
	await asyncRun(`push -u ${remote} ${branchName}`);
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
			const [_origin, branch] = pruned.split('/');
			const b_trimmed = branch.trim();
			if (localBranches.includes(b_trimmed)) {
				console.log(`Deleted Branch : ${b_trimmed}`);
				deleteBranch(b_trimmed, force);
			}
		}
	}
};

const pruneLocal = (force = false, remote) => {
	localBranches = getAllLocalBranchName();
	remoteBranches = getAllRemoteBranchName(remote);
	let dirty = false;
	for (br of localBranches) {
		if (!remoteBranches.includes(br)) {
			dirty = true;
			console.log(`Deleted Branch: ${br}`);
			deleteBranch(br, force);
		}
	}
	!dirty &&
		console.log(
			chalk.bgHex('#36bb09').hex('#000').bold(' You are all Synced! ')
		);
};

const newBranch = async () => {
	return new Promise(async (resolve, _) => {
		const b_name = readlineSync.question(
			'Type in the name of the branch you want to make: '
		);
		branch(b_name);
		if (getIfChanged()) {
			add();
			await commit();
		}
		return resolve(true);
	});
};
const normalPush = async (remote, b_name = null) => {
	return new Promise(async (resolve, _) => {
		if (getIfChanged()) {
			add();
			await commit();
		}
		await push(remote, b_name);
		return resolve(true);
	});
};

module.exports = {
	pruneRemote,
	newBranch,
	pruneLocal,
	normalPush,
	pullRequest,
	checkout,
	pull
};
