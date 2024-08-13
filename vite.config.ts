import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath } from 'url';
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import AutoImport from 'unplugin-auto-import/vite'

const pathSrc = path.resolve(__dirname, 'src')

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		AutoImport({
			resolvers: [
				ElementPlusResolver(),
				IconsResolver({
				    prefix: 'Icon',
				}),
			],
			dts: path.resolve(pathSrc, 'auto-imports.d.ts'),
		}),
		Components({
			resolvers: [
				ElementPlusResolver(),
				IconsResolver({
				    enabledCollections: ['ep'],
				})
			],
			dts: path.resolve(pathSrc, 'components.d.ts'),
		}),
		Icons({
		    autoInstall: true,
		}),
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	}, server: {
		port: 3000,
	},
})