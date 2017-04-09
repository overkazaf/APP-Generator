
let category = {
	name: './',
	files: [
		'gulpfile.js',
		'genpage.js',
		'.gitignore',
		'.eslintrc',
		'proxy.js',
		'MP_verify_hash.txt'
	],
	children: [
		{
			name: 'config',
			files: [
				'defaults.js',
				'package.js',
				'webpack.config.js',
				'webpack.dist.config.js'
			],
			children: []
		},
		{
			// resources
			name: 'res',
			files: [],
			children: [
				{
					name: 'fonts',
					files: [
						'font-webfont.eot__test',
						'font-webfont.svg__test',
						'font-webfont.ttf__test',
						'font-webfont.woff__test',
						'font-webfont.woff2__test'
					],
					children: []
				},
				{
					name: 'images',
					children: [
						{
							name: 'Test',
							files: [
								'aaa_bbb_ccc@2x.png__test',
								'aaa_bbb_ccc@3x.png__test'
							],
							children: []
						}
					]
				},
				{
					name: 'imgs',
					children: []
				}
			]
		},
		{
			name: 'src',
			children: [
				{
					name: 'javascript',
					children: [
						{
							name: 'components',
							children: [
								{
									name: 'TestComponent',
									files: [
										'index.jsx',
										'index.scss'
									]
								}
							]
						},
						{
							name: 'data',
							children: []
						},
						{
							name: 'config',
							files: [
								'config.json'
							],
							children: []
						},
						{
							name: 'constants',
							children: []
						},
						{
							name: 'extend',
							children: [
								{
									name: 'adaptor',
									files: [
										'BaseAdaptor.jsx'
									]
								}
							]
						},
						{
							name: 'page',
							children: []
						}
					]
				},
				{
					name: 'scss',
					files: [
						'_config.scss',
						'base.scss'
					],
					children: []
				},
				{
					name: '${project}Pages',
					children: []
				},

			]
		},
		{
			name: 'templates',
			files: [
				'index.tpl',
				'jsx.tpl',
				'style.tpl'
			]
		}
	]
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
	'config/webpack.config.dist.js': 'tpls/common/conf/webpack.config.dist.js',
	'.gitignore': 'tpls/common/.gitignore',
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