// @ts-check
import { defineConfig, svgoOptimizer, fontProviders } from 'astro/config'
import solidJs from '@astrojs/solid-js'
import compress from '@playform/compress'

// https://astro.build/config
export default defineConfig({
	integrations: [solidJs(), compress()],
	experimental: {
		svgOptimizer: svgoOptimizer()
	},
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Inter',
			cssVariable: '--font-inter',
			subsets: ['cyrillic', 'latin', 'vietnamese']
		},
		{
			provider: fontProviders.google(),
			name: 'Google Sans',
			cssVariable: '--font-google',
			subsets: [
				'cyrillic',
				'greek',
				'latin',
				'symbols',
				'thai',
				'vietnamese'
			]
		},
		{
			provider: fontProviders.local(),
			name: 'Kozuka Gothic Pro',
			cssVariable: '--font-kozuka',
			options: {
				variants: [
					{
						weight: 400,
						style: 'normal',
						src: ['./src/assets/fonts/KozGoPro-Regular.woff2']
					}
				]
			}
		},
		{
			provider: fontProviders.local(),
			name: 'HarmonyOS Sans',
			cssVariable: '--font-harmony',
			options: {
				variants: [
					{
						weight: 400,
						style: 'normal',
						src: [
							'./src/assets/fonts/HarmonyOS-Sans-SC-Regular.woff2'
						]
					}
				]
			}
		},
		{
			provider: fontProviders.local(),
			name: 'HarmonyOS Sans TC',
			cssVariable: '--font-harmony-tc',
			options: {
				variants: [
					{
						weight: 400,
						style: 'normal',
						src: [
							'./src/assets/fonts/HarmonyOS-Sans-TC-Regular.woff2'
						]
					}
				]
			}
		}
	],
	build: {
		assets: 'portals'
	},
	vite: {
		/*
        build: {
            assetsInlineLimit: 0,
            rollupOptions: {
                output: {
                    inlineDynamicImports: false,
                },
            },
        },

        plugins: [
            AutoImport({
                include: [/\.jsx$/, /\.tsx$/],
                resolvers: [
                    IconsResolver({
                        prefix: "I", // Icon
                        extension: "jsx",
                    }),
                ],
            }),
            Icons({
                iconCustomizer: (collection, icon, props) => {
                    props.width = "24px";
                    props.height = "24px";
                },
                compiler: "solid",
            }),
        ]
        */
	}
})
