import { defineConfig } from 'vitepress'

const guidesNav = [
  {
    text: 'Essentials',
    items: [
      {
        text: 'Introduction',
        link: '/guide/introduction',
      },
      {
        text: 'Installation',
        link: '/guide/installation',
      },
    ],
  },
  {
    text: 'Configuration',
    items: [
      {
        text: 'General configuration',
        link: '/guide/general_configuration',
      },
    ],
  },
  {
    text: 'Basic Usage',
    items: [
      {
        text: 'Static titles',
        link: '/guide/static_titles',
      },
      {
        text: 'Dynamic titles',
        link: '/guide/dynamic_titles',
      },
      {
        text: 'Brisk routes',
        link: '/guide/brisk_routes',
      },
      {
        text: 'Resource routes',
        link: '/guide/resource_routes',
      },
      {
        text: 'Standalone file',
        link: '/guide/standalone_file',
      },
      {
        text: 'Skip routes',
        link: '/guide/skip_routes',
      },
    ],
  },
]

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Adonis Breadcrumbs',
  description: 'Add breadcrumbs to AdonisJS routes only by defining titles',
  lastUpdated: true,
  lang: 'en-US',

  head: [
    ['meta', { property: 'og:title', content: 'Adonis Breadcrumbs' }],
    ['meta', { property: 'og:site_name', content: 'Adonis Breadcrumbs' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:description', content: '' }],
    ['meta', { property: 'og:url', content: '' }],
  ],

  themeConfig: {
    editLink: {
      pattern: 'https://github.com/Artian-Techs/adonis-breadcrumbs/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
    nav: [{ text: 'Home', link: '/' }],

    sidebar: {
      '/guide': [
        {
          text: 'Guide',
          items: guidesNav,
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/Artian-Techs/adonis-breadcrumbs' }],
  },
})
