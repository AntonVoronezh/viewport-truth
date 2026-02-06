import { defineConfig } from 'vitepress'

export default defineConfig({
    title: 'Viewport Truth',
    description: 'VisualViewport-first store for accurate visible viewport size in CSS pixels.',
    base: '/viewport-truth/',

    themeConfig: {
        nav: [
            { text: 'Docs', link: '/' },
            { text: 'GitHub', link: 'https://github.com/AntonVoronezh/viewport-truth' },
            { text: 'npm', link: 'https://www.npmjs.com/package/viewport-truth' }
        ],
        sidebar: [
            {
                text: 'Frameworks',
                items: [
                    { text: 'React', link: '/react' },
                    { text: 'Vue', link: '/vue' },
                    { text: 'Svelte', link: '/svelte' },
                    { text: 'Solid', link: '/solid' },
                    { text: 'Angular', link: '/angular' }
                ]
            },
            {
                text: 'Project',
                items: [
                    { text: 'FAQ', link: '/faq' },
                    { text: 'Common pitfalls', link: '/common-pitfalls' },
                    { text: 'Smoke test', link: '/smoke-test' },
                    { text: 'npm', link: '/npm' }
                ]
            }
        ]
    }
})
