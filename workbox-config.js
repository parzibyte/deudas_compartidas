module.exports = {
	globDirectory: 'dist/',
	globPatterns: [
		'**/*.{css,ico,eot,woff2,woff,ttf,png,html,js,json}'
	],
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	],
	swDest: 'dist/sw.js'
};