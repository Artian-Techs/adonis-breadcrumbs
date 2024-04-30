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
        text: 'Resource routes',
        link: '/guide/resource_routes',
      },
      {
        text: 'Standalone file',
        link: '/guide/standalone_file',
      },
    ],
  },
]

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Adonis Breadcrumbs',
  description: 'Add breadcrumbs to AdonisJS routes only by defining titles',

  head: [
    ['meta', { property: 'og:title', content: 'Adonis Breadcrumbs' }],
    ['meta', { property: 'og:site_name', content: 'Adonis Breadcrumbs' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:description', content: '' }],
    ['meta', { property: 'og:url', content: '' }],
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
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
