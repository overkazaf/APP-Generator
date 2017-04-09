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


	if (program.force) {
		removeProject(projectName);
	}


function removeProject(val) {
	if (fs.existsSync(`${projectName}`)) {
		console.log(`removing project "${chalk.yellow(`${projectName}`)}", need your ${chalk.red(`sudo`)} autherization...`);
		execSync(`sudo rm -r ${projectName}`);
		console.log(`project "${chalk.red(`${projectName}`)}" has been removed ${chalk.green('successfully')}`);
	} else {
		console.log(`project "${chalk.red(`${projectName}`)}" not exists, no need to remove`);
	}

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

	createDemoPage(appName, originalDirectory);
}

function createDemoPage(appName, originalDirectory) {
	process.chdir(path.join(originalDirectory, appName));

	console.log(` ${chalk.green(`generating demo page "Test"...`)}`);
	execSync('node genpage Test');
	console.log(` ${chalk.green(`page "Test" has been successfully generated...`)}`);

	process.chdir(originalDirectory);
}


function dfsCreate(config, dir) {

	config.files && config.files.map((file) => {
		const fileName = path.join(dir, file);
		fs.writeFileSync(
			fileName,
			genFileTemplate(fileName, projectMapping)
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

		try {
			fs.mkdirSync(folderName);
		} catch(e) {
			throw new Error(e);
		}

		dfsCreate(childDirConfig, folderName);
	});
}



function getIPAdress(){  
    var interfaces = require('os').networkInterfaces();  
    for(var devName in interfaces){  
          var iface = interfaces[devName];  
          for(var i=0;i<iface.length;i++){  
               var alias = iface[i];  
               if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){  
                     return alias.address;  
               }  
          }  
    }  
}  

const FSM = {
	copy: function(src, target) {
		console.log(`Copying ${chalk.green(`${src}`)} to ${chalk.green(`${target}`)}...`);
		execSync(`cp -r ${src} ${target}`);
	},
	parse: function(tpl) {
		return new OverCompiler({
			tpl: tpl,
			data: {}
		}, 'html').parse();
	}
};


function OverCompiler(option, targetCompileType) {
	this.option = option;
	this.mode = targetCompileType;
}

OverCompiler.prototype.lexer = function () {};
OverCompiler.prototype.parse = function () {};

function genFileTemplate(fileName) {
	let template = findTemplate(fileName);
	let re = /\$\{(.*?)\}/g;

	const ReplaceFSM = {
		project: () => {
			return projectName;
		},
		page: () => {
			return '${page}';
		},
		tpl: () => {
			return '${tpl}';
		},
		content: () => {
			return '${content}';
		},
		localIPAddress: () => {
			return getIPAdress();
		}
	};

	return template.replace(re, function(matched, cmd) {
		return (cmd in ReplaceFSM) ? ReplaceFSM[cmd]() : '';
	});
}




function findTemplate(fileName) {

	let target;

	Object.keys(projectMapping).map((file) => {
		if (fileName.indexOf(file) >= 0) {
			target = file;
			return;
		}
	});

	if (target) {

		console.log('fileName mapping found', projectMapping[target]);
		let readStream = fs.readFileSync(path.join(__dirname, projectMapping[target]));
		return readStream.toString();
	}

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

