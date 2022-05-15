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
const { clear, debug, force, pr, branch } = flags;

(async () => {
	init({ clear });
	input.forEach(command => {
		switch (command) {
			case 'prune-delete':
				automate.pruneRemote(force, remote);
				break;
			case 'prune-sync':
				automate.pruneLocal(force, remote);
				break;
			case 'nbpr':
				automate.newBranchPushPR(remote);
				break;
			case 'push':
				automate.normalPush(remote, branch ?? null);
				pr && automate.pullRequest(remote, branch ?? null);
				break;
			case 'pr':
				automate.pullRequest(remote);
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
