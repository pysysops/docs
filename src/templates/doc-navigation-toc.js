import React from 'react'
import PropTypes from 'prop-types'
import { graphql, Link } from 'gatsby'
import _ from 'lodash'

import Layout from '../components/layouts/default'
import { Spirit } from '../components/spirit-styles'
import NavSidebar from '../components/global/navigation-sidebar'
import FeedbackForm from '../components/global/feedback-form'
import PrevNext from '../components/global/prev-next'
import DesignNavSidebar from '../components/layouts/partials/design-nav-sidebar'
import TOC from '../components/layouts/partials/toc'
import MetaData from '../components/layouts/partials/meta-data'
// import Icon from '../components/global/icon'

function NavBar(props) {
    if (props.location.pathname.match(/\S\/design\//i)) {
        return <DesignNavSidebar />
    } else if (props.sidebar) {
        return <NavSidebar sidebar={ props.sidebar } location={ props.location } />
    } else {
        return null
    }
}

function PrevNextSection(props) {
    // Cover two cases:
    // 1. `/concepts/` page that walks through the associated sidebar file
    // 2. other pages, where we set a `next` property in frontmatter
    // The following code serializes the data and pass it to a generic component.

    if (props.sidebar === `concepts`) {
        const [sidebarfile] = props.sidebar ? require(`../data/sidebars/${props.sidebar}.yaml`) : {}

        if (!sidebarfile) {
            return null
        }

        const { groups } = sidebarfile
        const flatSidebar = []

        // Get all nested items and link and make a flat array
        _.forEach(groups, (section) => {
            _.forEach(section.items, (items) => {
                // Remember the group our items belong to
                items.group = section.group
                flatSidebar.push(items)
            })
        })

        const currentIndex = _.findIndex(flatSidebar, item => item.link === props.location.pathname)
        const prev = flatSidebar[currentIndex - 1]
        const next = flatSidebar[currentIndex + 1] || { group: `Setup`, link: `/setup/`, title: `Install Ghost` }

        return (
            <PrevNext prev={ prev } next={ next } />
        )
    } else if (props.fm.next && props.fm.next.title && props.fm.next.url) {
        // We *must* have at least URL and title
        const next = {
            title: props.fm.next.title,
            link: props.fm.next.url,
            description: props.fm.next.description || ``,
        }

        return (
            <PrevNext next={ next } />
        )
    } else {
        return null
    }
}

function PageHeader(props) {
    let title
    let subtitle
    let mainLink
    let subLink
    let bgClass = `bg-api-reference`

    // Handlebars
    if (props.location.pathname.match(/^\/api\//i)) {
        title = `API Reference`
        mainLink = `/api/`
        if (props.location.pathname.match(/\/handlebars-themes\//i)) {
            subtitle = `Handlebars`
            subLink = `/api/handlebars-themes/`
        }
        if (props.location.pathname.match(/\/gatsby\//i)) {
            subtitle = `Gatsby`
            subLink = `/api/gatsby/`
        }
        if (props.location.pathname.match(/\/content\//i)) {
            subtitle = `Content`
            subLink = `/api/content/`
        }
        if (props.location.pathname.match(/\/admin\//i)) {
            subtitle = `Admin`
            subLink = `/api/admin/`
        }
        if (props.location.pathname.match(/\/webhooks\//i)) {
            subtitle = `Webhooks`
            subLink = `/api/webhooks/`
        }
        if (props.location.pathname.match(/\/ghost-cli\//i)) {
            subtitle = `Ghost CLI`
            subLink = `/api/ghost-cli/`
        }
    }

    // Setup
    if (props.location.pathname.match(/^\/setup\//i) || props.location.pathname.match(/^\/install\//i)) {
        title = `Setup Guide`
        mainLink = `/setup/`
        bgClass = `bg-setup`
        if (props.location.pathname.match(/\/ghost-pro\//i)) {
            subtitle = `Ghost(Pro)`
            subLink = `/setup/ghost-pro/`
        }
        if (props.location.pathname.match(/\/ubuntu\//i)) {
            subtitle = `Ubuntu`
            subLink = `/install/ubuntu/`
        }
        if (props.location.pathname.match(/\/docker\//i)) {
            subtitle = `Docker`
            subLink = `/install/docker/`
        }
        if (props.location.pathname.match(/\/local\//i)) {
            subtitle = `Local`
            subLink = `/install/local/`
        }
        if (props.location.pathname.match(/\/source\//i)) {
            subtitle = `From Source`
            subLink = `/install/source/`
        }
    }

    // Core Concepts
    if (props.location.pathname.match(/^\/concepts\//i)) {
        title = `Core Concepts`
        mainLink = `/concepts/introduction/`
        bgClass = `bg-concepts`
    }

    if (title) {
        return (
            <div className={ bgClass }>
                <div className={ Spirit.page.xl + `pt-vw5 pt-vw1-ns pb-vw1 white` }>
                    <h1 className={ Spirit.h4 + `gh-integration-header-shadow` }>
                        <Link to={ mainLink } className={ `link dim ${subtitle ? `white-80 fw3` : `white`}` }>{ title }</Link>
                        { subtitle ? <Link to={ subLink } className="link white dim titleslash-white pl4 ml4 relative">{ subtitle }</Link> : null }
                    </h1>
                </div>
            </div>
        )
    } else {
        return null
    }
}

class DocTemplate extends React.Component {
    render() {
        const post = this.props.data.markdownRemark
        post.frontmatter.keywords = post.frontmatter.keywords || []
        post.frontmatter.sidebar = post.frontmatter.sidebar || ``
        post.frontmatter.toc = post.frontmatter.toc === false ? false : true

        var leftSidebar, rightSidebar, justification

        if (post.frontmatter.sidebar && post.frontmatter.toc) { // Layout #1: sidebar and TOC
            leftSidebar = <NavBar location={ this.props.location } sidebar={ post.frontmatter.sidebar } />
            rightSidebar = <TOC headingsOffset="-200" className="pr4" listClasses="mt3" />
            justification = `justify-between`
        } else if (post.frontmatter.sidebar || post.frontmatter.toc) { // Layout #2: sidebar only
            if (post.frontmatter.sidebar) {
                leftSidebar = <NavBar location={ this.props.location } sidebar={ post.frontmatter.sidebar } />
            } else {
                leftSidebar = <TOC headingsOffset="-200" listClasses="lefty" showHeading={ false } />
            }
            justification = `justify-start`
        } else {
            justification = `justify-center`
        }

        return (
            <>
                <MetaData data={ this.props.data } location={ this.props.location } type="article" />
                <Layout>
                    <PageHeader location={ this.props.location } />

                    <div className={ Spirit.page.xl + `flex ${justification}` }>
                        { leftSidebar ?
                            <div className={ `w-sidebar pt10 pr10 flex-shrink-0-l relative` }>
                                { leftSidebar }
                            </div>
                            : null }
                        <div className="w-100 mw-content bg-white shadow-2 br4 br--bottom">
                            <article className="flex-auto pa15 pt10 pb10">
                                <h1 className={ Spirit.h1 + `darkgrey` }>{ post.frontmatter.title }</h1>
                                <section className="post-content" dangerouslySetInnerHTML={ {
                                    __html: post.html,
                                } } />

                            </article>
                            <div className="mw-content pa15 pb0 pt0 bt b--whitegrey mt5">
                                <PrevNextSection
                                    location={ this.props.location }
                                    sidebar={ post.frontmatter.sidebar }
                                    fm={ post.frontmatter }
                                />
                            </div>
                        </div>
                        { rightSidebar ?
                            <div className="order-3 w-sidebar flex-shrink-0 dn db-l pt10 pl7">
                                { rightSidebar }
                            </div>
                            : null }
                    </div>
                    <FeedbackForm location={ this.props.location } />
                </Layout>
            </>
        )
    }
}

DocTemplate.propTypes = {
    data: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
}

export default DocTemplate

export const articleQuery = graphql`
    query($slug: String!) {
        site {
            ...SiteMetaFields
        }
        markdownRemark(fields: { slug: {eq: $slug}}) {
            ...MarkdownFields
        }
    }
`
