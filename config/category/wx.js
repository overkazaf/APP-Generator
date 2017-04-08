
let category = {};

category = {
	name: './',
	files: [
	],
	children: [
		{
			name: 'config',
			files: [
				'default.js',
				'package.js',
				'webpack.config.js',
				'webpack.dist.conig.js'
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
						'font-webfont.eot',
						'font-webfont.svg',
						'font-webfont.ttf',
						'font-webfont.woff',
						'font-webfont.woff2'
					],
					children: []
				},
				{
					name: 'images',
					children: [
						{
							name: 'DemoPageName',
							files: [
								'aaa_bbb_ccc@2x.png',
								'aaa_bbb_ccc@3x.png'
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
							children: []
						},
						{
							name: 'data',
							children: []
						},
						{
							name: 'extend',
							children: []
						},
						{
							name: 'page',
							children: []
						}
					]
				},
				{
					name: 'scss',
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

module.exports = category;