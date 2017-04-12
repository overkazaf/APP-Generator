'use strict';

const validateProjectName = require('validate-npm-package-name');
const chalk = require('chalk');
const commander = require('commander');
const fs = require('fs-extra');
const path = require('path');
const execSync = require('child_process').execSync;
const exec = require('child_process').exec;
const spawn = require('cross-spawn');
const semver = require('semver');
const dns = require('dns');
const tmp = require('tmp');
const unpack = require('tar-pack').unpack;
const hyperquest = require('hyperquest');

const packageJson = require('./package/wx.json');
const projectInfo = require('./info/wx.js');
const projectConfig = projectInfo.category;
const projectMapping = projectInfo.mapping;


const isProjectNameValid = (projectName) => {
	return validateProjectName(projectName).validForNewPackages;
};

let projectName;

const program = new commander.Command(packageJson.name)
	.version(packageJson.version)
	.arguments('<project-directory>')
	.usage(`${chalk.green('<project-directory>')} [options]`)
	.action(name => {
		projectName = name;
	})
	.option('--verbose', 'print additional logs')
	.option('-R, --remove', 'Warning: remove specific project, only allow this parameter on debug mode')
	.option('-f, --force', 'Warning: force creating project if there exists a same one, will do remove command first, check your app name')
	.option(
		'--scripts-version <alternative-package>',
		'use a non-standard version of react-scripts'
	)
	.allowUnknownOption()
	.on('--help', () => {
		console.log(`	Only ${chalk.green('<project-directory>')} is required.`);
		console.log();
		console.log(
			`	A custom ${chalk.cyan('--scripts-version')} can be one of:`
		);
		console.log(`	- a specific npm version: ${chalk.green('0.8.2')}`);
	})
	.parse(process.argv);

	if (projectName == '\/') {
		console.log(
			`Warning: root "${chalk.red(`${program.name()}`)}" cannot be created.`
		);
		process.exit(1);
	}

	if (typeof projectName === 'undefined') {
		console.error('Please specify the project directory:');
		console.log(
			`	${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}`
		);
		console.log();
		console.log('For example:');
		console.log(`	${chalk.cyan(program.name())} ${chalk.green('my-react-wx-app')}`);
		console.log();
		console.log(
			`Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
		);

		process.exit(1);
	}

	if (!program.remove && fs.existsSync(`${projectName}`)) {
		console.log(`project "${chalk.red(`${projectName}`)}" already exists, you can remove it by ${chalk.yellow(`-R, --remove`)} or ${chalk.yellow(`--force`)} option`);
		process.exit(1);
	}

	if (program.remove) {
		removeProject(projectName);
		process.exit(1);
	}


	if (program.force) {
		removeProject(projectName);
	}


function removeProject(val) {
	if (projectName === '/') {
		console.log(`Cannot remove ${chalk.red(`root`)} folder!!!`);
		process.exit(1);
	}

	if (fs.existsSync(`${projectName}`)) {
		console.log(`removing project "${chalk.yellow(`${projectName}`)}", need your ${chalk.red(`sudo`)} autherization...`);
		execSync(`sudo rm -r ${projectName}`);
		console.log(`project "${chalk.red(`${projectName}`)}" has been removed ${chalk.green('successfully')}`);
	} else {
		console.log(`project "${chalk.red(`${projectName}`)}" not exists, no need to remove`);
	}
}



