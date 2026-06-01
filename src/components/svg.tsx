import { type JSX, splitProps } from 'solid-js'

interface SvgProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
	raw: string
	strokeWidth?: number
}

const parseAttributes = (str: string) => {
	const attributes: Record<string, string> = {}
	const attrRegex = /([a-zA-Z0-9\-_]+)="([^"]*)"/g

	for (const match of str.matchAll(attrRegex)) {
		attributes[match[1]] = match[2]
	}

	return attributes
}

export default function Svg(props: SvgProps) {
	const [local, others] = splitProps(props, ['raw', 'strokeWidth'])

	/*
    const svgAttributes = Object.entries(others)
        .map(([k, v]) => `${k}="${v}"`)
        .join(" ");
    */

	const openSvgTag = local.raw.match(/<svg[^>]*\/?>/gi)
	if (!openSvgTag) return <div>Invalid SVG format.</div>

	const format = (
		local.strokeWidth
			? local.raw.replaceAll(
					/stroke-width\s*=\s*"[^"]*"/gi,
					`stroke-width: "${local.strokeWidth}"`
			  )
			: local.raw
	)
		.replace(openSvgTag[0], '')
		.replace('</svg>', '')

	return (
		<svg
			innerHTML={format}
			{...parseAttributes(openSvgTag[0].slice(5, -1).trim())}
			{...others}
		/>
	)
}
