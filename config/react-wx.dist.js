'use strict';

const validateProjectName = require('validate-npm-package-name');
const chalk = require('chalk');
const commander = require('commander');
const fs = require('fs-extra');
const path = require('path');
const execSync = require('child_process').execSync;
const spawn = require('cross-spawn');
const semver = require('semver');
const dns = require('dns');
const tmp = require('tmp');
const unpack = require('tar-pack').unpack;
const hyperquest = require('hyperquest');

const packageJson = require('./package/wx.json');
const projectConfig = require('./category/wx.js');

const isProjectNameValid = projectName => {
	return validateProjectName(projectName).validForNewPackages;
};

if (isProjectNameValid('aaa')) {
	chalk.blue('yah');
}

let projectName;

const program = new commander.Command(packageJson.name).version(packageJson.version).arguments('<project-directory>').usage(`${ chalk.green('<project-directory>') } [options]`).action(name => {
	projectName = name;
}).option('--verbose', 'print additional logs').option('--scripts-version <alternative-package>', 'use a non-standard version of react-scripts').allowUnknownOption().on('--help', () => {
	console.log(`	Only ${ chalk.green('<project-directory>') } is required.`);
	console.log();
	console.log(`	A custom ${ chalk.cyan('--scripts-version') } can be one of:`);
	console.log(`	- a specific npm version: ${ chalk.green('0.8.2') }`);
}).parse(process.argv);

if (typeof projectName === 'undefined') {
	console.error('Please specify the project directory:');
	console.log(`	${ chalk.cyan(program.name()) } ${ chalk.green('<project-directory>') }`);
	console.log();
	console.log('For example:');
	console.log(`	${ chalk.cyan(program.name()) } ${ chalk.green('my-react-wx-app') }`);
	console.log();
	console.log(`Run ${ chalk.cyan(`${ program.name() } --help`) } to see all options.`);

	process.exit(1);c;
}

const hiddenProgram = new commander.Command().option('--internal-testing-template <path-to-template>', '(internal usage only, DO NOT RELY ON THIS)' + 'use a non-standard application template').parse(process.args);

createApp(projectName, program.verbose, program.scriptsVersion, verbose, version, template);

function createApp(name, verbose, version, template) {
	const root = path.resolve(name);
	const appName = pash.basename(root);

	console.log(root, appName);
}
