import { Glob } from 'bun'
import { BlobReader, BlobWriter, ZipWriter } from '@zip.js/zip.js'
import astro from '../astro.config.mjs'
import npackage from '../package.json'
import manifest from '../manifest.json'

// init
const start = performance.now()
console.info('[Portal]: Building extension...')

// write manifest.json
await Bun.write(
	'dist/manifest.json',
	JSON.stringify({ ...manifest, ...{ version: npackage['version'] } })
)

// exclude inline js
const html = await Bun.file('dist/index.html').text()
const scriptMap = new Map()
const regexS = /<script([^>]*)>([\s\S]*?)<\/script>/gi
for (const match of html.matchAll(regexS)) {
	// const attributes = match[1];
	const content = match[2].trim()
	const hash = new Bun.CryptoHasher('sha256')
		.update(content)
		.digest('hex')
		.substring(0, 8)
	const src = `index.${hash}.js`

	await Bun.write(`dist/${astro.build?.assets}/${src}`, content)
	scriptMap.set(content, src)
}
await Bun.write(
	'dist/index.html',
	html.replace(regexS, (m, attributes, c) => {
		const isModule = attributes.includes('type=module')
		return `<script ${isModule ? `type="module" ` : ''}src="${astro.build
			?.assets}/${scriptMap.get(c.trim())}"></script>`
	})
)

// zip
const zipWriter = new ZipWriter(new BlobWriter('application/zip'))

for await (const file of new Glob('**/*').scan('dist')) {
	if (
		file.includes('.zip') ||
		file.includes('.map') ||
		file.startsWith('_') ||
		file.includes('\\_')
	)
		continue
	await zipWriter.add(
		file.replaceAll('\\', '/'),
		new BlobReader(Bun.file('dist/' + file))
	)
}

await Bun.write(
	`dist/${npackage['name']}-v${npackage['version']}.zip`,
	await zipWriter.close()
)

console.info(`[Portal]: Completed in ${performance.now() - start}ms`)
process.exit()
