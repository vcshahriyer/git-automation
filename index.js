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
const { clear, debug, force, branch } = flags;

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
				automate.newBranchPushPR(remote);
				break;
			case 'p':
				automate.normalPush(remote, branch || null);
				break;
			case 'pr':
				automate.pullRequest(branch || null);
				break;
			case 'help':
				cli.showHelp(0);
				break;

			default:
				cli.showHelp(0);
				break;
		}
	});
	debug && log(flags);
})();
