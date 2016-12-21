const path = require( 'path' ),
	src = path.join( __dirname, 'src' );

module.exports = {
	context: src,
	entry: './todo-app',
	output: {
		filename: 'bundle.js',
		publicPath: '/assets',
		path: path.join( __dirname, 'dist', 'assets' )
	},
	devServer: {
		contentBase: src
	},
	module: {
		rules: [{
			test: /\.css$/,
			use: [ 'style-loader', 'css-loader' ]
		}, {
			test: /\.html$/,
			use: [ 'html-loader' ]
		}]
	}
};