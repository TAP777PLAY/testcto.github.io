import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'SiteBuilder',
  tagline: 'Конструктор сайтов на русском языке',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://docs.sitebuilder.ru',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'sitebuilder', // Usually your GitHub org/user name.
  projectName: 'sitebuilder', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'ru',
    locales: ['ru'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl:
            'https://github.com/sitebuilder/sitebuilder/tree/main/docs/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl:
            'https://github.com/sitebuilder/sitebuilder/tree/main/docs/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'SiteBuilder',
      logo: {
        alt: 'SiteBuilder Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Документация',
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiSidebar',
          position: 'left',
          label: 'API',
        },
        {to: '/blog', label: 'Блог', position: 'left'},
        {
          href: 'https://github.com/sitebuilder/sitebuilder',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Документация',
          items: [
            {
              label: 'Начало работы',
              to: '/intro',
            },
            {
              label: 'Руководство пользователя',
              to: '/user-guide',
            },
            {
              label: 'API',
              to: '/api',
            },
          ],
        },
        {
          title: 'Сообщество',
          items: [
            {
              label: 'Telegram',
              href: 'https://t.me/sitebuilder_community',
            },
            {
              label: 'Discord',
              href: 'https://discord.gg/sitebuilder',
            },
            {
              label: 'GitHub Issues',
              href: 'https://github.com/sitebuilder/sitebuilder/issues',
            },
          ],
        },
        {
          title: 'Ещё',
          items: [
            {
              label: 'Блог',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/sitebuilder/sitebuilder',
            },
            {
              label: 'Главная',
              href: 'https://sitebuilder.ru',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} SiteBuilder. Сделано с ❤️ для русскоязычного комьюнити.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
