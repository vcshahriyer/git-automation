const meow = require('meow');
const meowHelp = require('cli-meow-help');

const flags = {
	clear: {
		type: `boolean`,
		default: false,
		alias: `c`,
		desc: `Clear the console`
	},
	branch: {
		type: `string`,
		default: '',
		alias: `b`,
		desc: `Branch name (** without-space)`
	},
	noClear: {
		type: `boolean`,
		default: false,
		desc: `Don't clear the console`
	},
	debug: {
		type: `boolean`,
		default: false,
		alias: `d`,
		desc: `Print debug info`
	},
	version: {
		type: `boolean`,
		alias: `v`,
		desc: `Print CLI version`
	},
	force: {
		type: `boolean`,
		default: false,
		alias: `f`,
		desc: `Force delete branch`
	}
};

const commands = {
	help: { desc: `Print help info` },
	pnd: { desc: 'Prune and delete local branches.' },
	pnc: { desc: 'Delete local branches that are not in remote.' },
	nbpr: { desc: `Push new branch and make pull request.` },
	push: { desc: `Push current branch or with (--b="branch-name)".` },
	pr: { desc: `Create a pull request optional (--b="branch-name").` }
};

const helpText = meowHelp({
	name: `autogit`,
	flags,
	commands
});

const options = {
	inferType: true,
	description: false,
	hardRejection: false,
	flags
};

module.exports = meow(helpText, options);
