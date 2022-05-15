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
const { clear, debug } = flags;

(async () => {
	init({ clear });
	input.forEach(command => {
		switch (command) {
			case 'prune-delete':
				automate.pruneRemote(false, remote);
				break;
			case 'prune-sync':
				automate.pruneLocal(false, remote);
				break;
			case 'nbpr':
				automate.newBranchPushPR(remote);
				break;
			case 'push':
				automate.normalPush(remote);
				break;
			case 'pr':
				automate.pullRequest(remote);
				break;
			case 'help':
				cli.showHelp(0);
				break;

			default:
				break;
		}
	});
	debug && log(flags);
})();
