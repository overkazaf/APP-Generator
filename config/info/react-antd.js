
let category = {
	name: '/',
	children: []
};

let mapping = {
	'templates/index.tpl': 'tpls/wx/index.tpl',
	'templates/jsx.tpl': 'tpls/wx/jsx.tpl',
	'templates/style.tpl': 'tpls/wx/style.tpl',
	'genpage.js': 'tpls/wx/genpage.js',
	'MP_verify_hash.txt': 'tpls/wx/MP_verify_hash.txt',
	'gulpfile.js': 'tpls/wx/gulpfile.js',
	'config/defaults.js': 'tpls/common/conf/defaults.js',
	'config/package.js': 'tpls/common/conf/package.js',
	'config/webpack.config.js': 'tpls/common/conf/webpack.config.js',
	'config/webpack.dist.config.js': 'tpls/common/conf/webpack.dist.config.js',
	'.eslintrc': 'tpls/common/.eslintrc',
	'proxy.js': 'tpls/common/proxy.js',
	'src/scss/base.scss': 'tpls/common/base.scss',
	'src/scss/_config.scss': 'tpls/common/_config.scss',
	'src/javascript/extend/adaptor/BaseAdaptor.jsx': 'tpls/common/extend/adaptor/BaseAdaptor.jsx',
	'src/javascript/config/config.json': 'tpls/common/extend/config/config.json',
};

module.exports = {
	category: category,
	mapping: mapping
};
