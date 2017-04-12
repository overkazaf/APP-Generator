const fs = require('fs');
const path = require('path');

const readStream = fs.readFileSync('./files/defaults.js');
const fileContent = readStream.toString();


const re = /var pages\s*=\s*\[([^;]+)\];/gm;

let page = 'ddd';
let newPage = 'ggg';

let r = fileContent.replace(re, function(matched, cc) {
	let comma = cc.replace(/[ \s\t\r\n]/gm, '').length ? ',': '';
	return `var pages = [
{
    name: '${page}/index',
    entry: '${page}/index.jsx',
    ftl: 'aaaPages/${page}/index.html'
}${comma}
${cc}
];`;
});

console.log('r', r);

r = r.replace(re, function(matched, cc) {
	let comma = cc.replace(/[ \s\t\r\n]/gm, '').length ? ',': '';
	return `var pages = [
{
    name: '${newPage}/index',
    entry: '${newPage}/index.jsx',
    ftl: 'aaaPages/${newPage}/index.html'
}${comma}
${cc}
];`;
});

console.log('r',r);

