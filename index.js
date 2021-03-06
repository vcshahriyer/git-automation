#!/usr/bin/env node

/**
 * git-automation
 * Automate your git workflow with a single script.
 *
 * @author Raghib Shahriyer <https://ingeniousinside.com/vcshahriyer>
 */

const init = require('./utils/init');
const cli = require('./utils/cli');
const log = require('./utils/log');
const automate = require('./utils/automate');

const remote = 'origin';
const input = cli.input;
const flags = cli.flags;
const { clear, debug, force, branch, backTo } = flags;

(async () => {
	init({ clear });

	await input.reduce(async (memo, command) => {
		await memo;
		switch (command) {
			case 'pnd':
				automate.pruneRemote(force, remote);
				break;
			case 'pnc':
				automate.pruneLocal(force, remote);
				break;
			case 'nb':
				await automate.newBranch(remote);
				break;
			case 'p':
				await automate.normalPush(remote, branch || null);
				break;
			case 'pr':
				automate.pullRequest(branch || null);
				break;
			case 'pll':
				await automate.pull(remote, branch || null);
				break;
			case 'help':
				cli.showHelp(0);
				break;
			default:
				cli.showHelp(0);
				break;
		}
	}, Promise.resolve());
	backTo && automate.checkout(backTo);
	debug && log(flags);
})();
