import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    webpack(config, { isServer }) {
        const fileLoaderRule = config.module.rules.find((rule: any) =>
            rule.test?.test?.('.svg'),
        )

        if (fileLoaderRule && fileLoaderRule.test instanceof RegExp) {
            fileLoaderRule.exclude = /\.svg$/i;
        }

        config.module.rules.push(
            {
                ...fileLoaderRule,
                test: /\.svg$/i,
                resourceQuery: /url/,
            },
            {
                test: /\.svg$/i,
                issuer: fileLoaderRule.issuer,
                resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] },
                use: [{
                    loader: '@svgr/webpack',
                    options: {
                        svgo: false,
                        dimensions: false,
                    },
                },],
            },
        )

        return config;
    },
    compiler: {
        styledComponents: true,
    },
    // experimental: {
    //     turbo: {
    //         rules: {
    //             '*.svg': {
    //                 loaders: [
    //                     {
    //                         loader: '@svgr/webpack',
    //                         options: {
    //                             svgo: false,
    //                             dimensions: false,
    //                         }
    //                     }
    //                 ],
    //                 as: '*.js',
    //             },
    //         },
    //     },
    // },
    output: 'standalone', //lambda에서 사용하기 위해 필요
};

export default nextConfig;
