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
const projectConfig = require('./category/wx.js');


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
	.option('-R, --remove', 'remove specific project')
	.option('-f, --force', 'force creating project if there exists a same one')
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


	if (program.remove) {
		removeProject(projectName);
		process.exit(1);
	}



function removeProject(val) {
	console.log(`removing project ${chalk.red(`${projectName}`)} ...`);
	execSync(`sudo rm -r ${projectName}`);
	console.log(`project ${chalk.red(`${projectName}`)} has been removed ${chalk.green('successfully')}`);
}


// const hiddenProgram = new commander.Command()
// 	.option(
// 		'--internal-testing-template <path-to-template>',
// 		'(internal usage only, DO NOT RELY ON THIS)' +
// 		'use a non-standard application template'
// 	)
// 	.parse(process.args);


createApp(
	projectName,
	program.verbose,
	program.scriptsVersion
	//hiddenProgram.internalTestingTemplate
);

function createApp(name, verbose, version, template) {
	const root = path.resolve(name);
	const appName = path.basename(root);

	fs.ensureDirSync(name);
	console.log(root, appName);

	let appPackageJson = Object.assign(packageJson, {
		name: appName,
		version: '0.1.0',
		private: true,
	});

	fs.writeFileSync(
		path.join(root, 'package.json'),
		JSON.stringify(appPackageJson, null, 2)
	);

	const originalDirectory = process.cwd();
	process.chdir(root);

	run(root, appName, version, verbose, originalDirectory, 'template');
}


function dfsCreate(config, dir) {

	config.files && config.files.map((file) => {
		const fileName = path.join(dir, file);
		fs.writeFileSync(
			fileName,
			genFileTemplate(fileName)
		);
	});

	config.children && config.children.map((childDirConfig) => {
		let folderName = path.join(dir, childDirConfig.name);

		folderName = folderName.replace(/\$\{(.*?)\}/g, function(matched, id) {
			switch(id) {
				case 'project':
					return projectName;
				default:
					return matched;
			}
		});

		console.log('folderName', folderName);

		try {
			fs.mkdirSync(folderName);
		} catch(e) {
			throw new Error(e);
		}

		dfsCreate(childDirConfig, folderName);
	});
}

const ReplaceMap = {
	projectName: projectName
};

function genFileTemplate(fileName) {
	let template = findTemplate(fileName);
	let re = /{{(.*?)}}/gi;
	return template.replace(re, function(matched, cmd) {
		return ReplaceMap[cmd]();
	});
}

function findTemplate() {
	return '';
}


function run(root, appName, version, verbose, originalDirectory, template) {
	
	dfsCreate(projectConfig, root);

	// install all packages while successfully create the project structure
	
	console.log();
	console.log(
		`${chalk.cyan('Installing node dependency packages...')}`
	);
	console.log(
		`${chalk.cyan('You need to wait a minute...')}`
	);
	console.log();

	const useYarn = shouldUseYarn();
	let installPackagesCMD = 'yarn';
	if (!useYarn) {
		installPackagesCMD = 'npm install';
	}


	let childProcess = exec(installPackagesCMD);

	childProcess.stdout.pipe(process.stdout);
	childProcess.stderr.pipe(process.stderr);
}

function shouldUseYarn() {
	try {
		execSync('yarnpkg --version', { stdio: 'ignore'});
		return true;
	} catch (e) {
		return false;
	}
}

function install(useYarn, dependencies, verbose, isOnline) {

}

function checkIfOnline(useYarn) {
	if (!useYarn) {
		return Promise.resolve(true);
	}

	return new Promise(resolve => {
		dns.lookup('registry.yarnpkg.com', err => {
			resolve(err === null);
		});
	});
}

