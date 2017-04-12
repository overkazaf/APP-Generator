let category = {
	name: './',
	children: [
		{
			name: 'config',
		},
		{
			name: 'src',
			files: [
				'index.html',
				'app.js',
			],
			children: [
				{
					name: 'components',
				},
				{
					name: 'containers',
				},
				{
					name: 'layouts',
				},
				{
					name: 'routes',
				},
				{
					name: 'styles'
				},
				{
					name: 'store'
				}
			],
		},
		{
			name: 'tests',
		}
	]
};

let mapping = {};

module.exports = {
	category: category,
	mapping: mapping
};