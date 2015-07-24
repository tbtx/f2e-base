module.exports = {
    context: __dirname,
    entry: {
        'tbtx': './src/tbtx.js'
        // 'tbtx.mobile': './src/tbtx.mobile.js'
    },
    output: {
        path: __dirname,
        filename: '[name].js',

        library: 'tbtx',
        libraryTarget: 'umd'
    },

    module: {
        loaders: [

        ]
    }
}