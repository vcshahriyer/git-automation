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
const automate = require('./automate');

const remote = 'origin';
const input = cli.input;
const flags = cli.flags;
const { clear, debug, force, branch, backTo } = flags;

(async () => {
	init({ clear });
	input.forEach(command => {
		switch (command) {
			case 'pnd':
				automate.pruneRemote(force, remote);
				break;
			case 'pnc':
				automate.pruneLocal(force, remote);
				break;
			case 'nb':
				automate.newBranch(remote);
				console.log('New branch');
				break;
			case 'p':
				automate.normalPush(remote, branch || null);
				console.log('From push');
				break;
			case 'pr':
				automate.pullRequest(branch || null);
				console.log('From pr');
				break;
			case 'pll':
				automate.pull(remote, branch || null);
				break;
			case 'help':
				cli.showHelp(0);
				break;
			default:
				cli.showHelp(0);
				break;
		}
	});
	backTo && automate.checkout(backTo);
	debug && log(flags);
})();
