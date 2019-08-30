module.exports = {
    entry: "./main.ts",
    resolve: {
        extensions: ['.ts']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader'
            }
        ]
    },
    mode: "development"
}