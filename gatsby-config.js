const postcssCustomMedia = require(`postcss-custom-media`)
const autoprefixer = require(`autoprefixer`)
const cssVariables = require(`postcss-css-variables`)
const colorModFunction = require(`postcss-color-mod-function`)
const cssNano = require(`cssnano`)
const customProperties = require(`postcss-custom-properties`)
const easyImport = require(`postcss-easy-import`)
const algoliaQueries = require(`./src/utils/algolia-queries`)

require(`dotenv`).config({
    path: `.env.${process.env.NODE_ENV}`,
})

if (!process.env.GH_CLIENT_SECRET) {
    throw new Error(
        `GH_CLIENT_SECRET is required to build. Check the README.`
    )
}

module.exports = {
    siteMetadata: {
        title: `Ghost Docs`,
        siteUrl: process.env.SITE_URL || `https://docs.ghost.org`,
        description: `Everything you need to know about working with the Ghost professional publishing platform.`,
    },
    plugins: [
        /**
         *  Content Plugins
         */
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                path: `${__dirname}/content/`,
                name: `markdown-pages`,
            },
        },
        {
            resolve: `gatsby-transformer-remark`,
            options: {
                plugins: [
                    {
                        resolve: `gatsby-remark-images`,
                        options: {
                            maxWidth: 590,
                        },
                    },
                    `gatsby-remark-code-titles`,
                    `gatsby-remark-prismjs`, // TODO: make aliases work!
                    `gatsby-remark-external-links`,
                    `gatsby-remark-autolink-headers`,
                ],
            },
        },
        `gatsby-transformer-sharp`,
        `gatsby-plugin-sharp`,
        `gatsby-transformer-yaml`,
        {
            resolve: `gatsby-source-ghost`,
            options: {
                apiUrl: `https://docs-2.ghost.io`,
                clientId: `ghost-frontend`,
                clientSecret: `${process.env.GH_CLIENT_SECRET}`,
            },
        },
        {
            resolve: `gatsby-plugin-algolia`,
            options: {
                appId: `6RCFK5TOI5`,
                apiKey: `${process.env.ALGOLIA_ADMIN_KEY}`,
                queries: algoliaQueries,
                chunkSize: 10000, // default: 1000
            },
        },
        `gatsby-plugin-catch-links`,
        /**
         *  Utility Plugins
         */
        {
            resolve: `gatsby-plugin-manifest`,
            options: {
                name: `Ghost Docs`,
                short_name: `Ghost`,
                start_url: `/`,
                background_color: `#343f44`,
                theme_color: `#343f44`,
                display: `minimal-ui`,
                icon: `src/images/favicon.png`,
            },
        },
        `gatsby-plugin-offline`,
        `gatsby-plugin-react-helmet`,
        `gatsby-plugin-sitemap`,
        /**
         *  Display Plugins
         */
        {
            resolve: `gatsby-plugin-postcss`,
            options: {
                postCssPlugins: [
                    autoprefixer({ browsers: [`last 2 versions`] }),
                    easyImport(),
                    cssVariables(),
                    colorModFunction(),
                    customProperties({ preserve: false }),
                    postcssCustomMedia(),
                    cssNano({ zindex: false }),
                ],
            },
        },
        {
            resolve: `gatsby-plugin-react-svg`,
            options: {
                rule: {
                    include: /icons/,
                },
            },
        },
    ],
}
