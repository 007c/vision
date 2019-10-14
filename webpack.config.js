const path = require('path');
module.exports = {
    entry: "./demo/main.ts",
    resolve: {
        extensions: ['.ts']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader'
            },
            // {
            //     test: /\.vision$/,
            //     use: path.resolve('vision-loader/index.js')
            // }
        ]
    },
    mode: "development"
}