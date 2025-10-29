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
    experimental: {
        turbo: {
            rules: {
                '*.svg': {
                    loaders: [
                        {
                            loader: '@svgr/webpack',
                            options: {
                                svgo: false,
                                dimensions: false, // 이 부분을 명시적으로 추가해야 합니다.
                            }
                        }
                    ],
                    as: '*.js',
                },
            },
        },
    },
};

export default nextConfig;
