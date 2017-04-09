var fs = require('fs'),
	path = require('path'),
	cp = require('child_process');

function usage() {
	console.log('===========================Usage=============================');
	console.log('=                                                           =');
	console.log('=         node gen pagename [template suffix:html|tpl]      =');
	console.log('=                                                           =');
	console.log('=============================================================');
};

usage();

var paths = {
	'page': './src/javascript/page/',
	'tpl': './src/sijiPages/',
	'style': './src/scss/',
	'templates' : './templates/'
};


function execCmd() {
	var page = process.argv[2];
	var tplSubfix = process.argv[3] || 'html';
	var tplJson = readTplFiles();
	var targetFilesInfo = parseTpls(tplJson, {
		page: page,
		tplSubfix: tplSubfix
	});

	writeGenFiles(targetFilesInfo);
}

execCmd();

function parseTpls (tplContents, parseOption) {
	var parsedContentInfomation = {};
	var parseSingleTpl = parseTplByStretagy();
	for (var tplKey in tplContents) {
		(function (key, content) {
			parsedContentInfomation[key] = parseSingleTpl(key, content[key], parseOption);
		})(tplKey, tplContents);
	}
	return parsedContentInfomation;
}



function parseTplByStretagy(){
	var commands = {
		'pagename' : function (opt) {
			return opt.page.toLowerCase();
		},
		'PageName' : function (opt) {
			return opt.page;
		}
	};
	var parseTplStretagy = {
		'tpl' : function (content, option) {
			var pageContent = new String(content).replace(/{{(.*?)}}/gm, function (group, matched){
				return commands[matched](option);
			});
			return {
				name: 'index',
				filepath: paths.tpl + option.page + '/',
				content: pageContent,
				subfix: option.tplSubfix
			};
		},
		'entry' : function (content, option) {
			var pageContent = new String(content).replace(/{{(.*?)}}/gm, function (group, matched){
				return commands[matched](option);
			});
			return {
				name: 'index',
				filepath: paths.page + option.page + '/',
				content: pageContent,
				subfix: 'jsx'
			};
		},
		'style' : function (content, option) {
			var pageContent = new String(content).replace(/{{(.*?)}}/gm, function (group, matched){
				return commands[matched](option).toLowerCase();
			});
			return {
				name: 'index',
				filepath: paths.style + option.page + '/',
				content: pageContent,
				subfix: 'scss'
			};
		},
	};

	return function (tplKey, content, option) {
		return parseTplStretagy[tplKey](content, option);
	};

}


function writeGenFiles (targetFilesInfo) {
	for (var key in targetFilesInfo) {
		(function (key, targetFilesInfo) {
			var info = targetFilesInfo[key];
			var dirname = path.join(__dirname, info.filepath);
			var filepath = dirname + info.name +'.' + info.subfix;
			var writeFileFn = function () {
				fs.writeFile(filepath, info.content, function (err){
					if (err) throw err;
					console.log('file ' + info.name + ' has been written to path ' + filepath + ' successfully');

					console.log('file ' + info.name + ' exists', fs.existsSync(filepath));
				});
			};

			fs.exists(dirname, function (exists){
				if (exists) {
					//writeFileFn();
					console.log('Page exists, check your parameters');
				} else {
					fs.mkdir(dirname, 0o777, function (err) {
						if (err) throw err;
						console.log('new folder['+ dirname +']has been successfully created');
						writeFileFn();
					});
				}
			});
		})(key, targetFilesInfo);
	}
}

function readTplFiles () {
	var contentMap = {};
	var tplNames = {
		tpl: 'index.tpl',
		entry: 'jsx.tpl',
		style: 'style.tpl'
	};

	for (var tplNameKey in tplNames) {
		var tplName = [paths.templates, tplNames[tplNameKey]].join('');
		contentMap[tplNameKey] = fs.readFileSync(path.join(__dirname, tplName));
	}

	return contentMap;
}