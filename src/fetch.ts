import { SearchConfig } from './config'

export interface SuggestionItem {
	query?: string
	title?: string
	description?: string
	image?: string
	phrase?: string
}

let abortController: AbortController | undefined

export const getBangsSuggestions = async (
	phrase: string
): Promise<SuggestionItem[]> => {
	if (abortController) abortController.abort()
	const localController = new AbortController()
	abortController = localController
	try {
		const data = await fetch(SearchConfig.bangs.replace('%s', phrase), {
			signal: localController.signal
		}).then((e) => e.json())

		return data
			.map((item: any) => ({
				title: item.snippet,
				phrase: item.phrase,
				image: item.image
			}))
			.slice(0, 16)
	} catch (e) {
		if ((e as any)?.name === 'AbortError') return []
		console.error(e)
	}
	return []
}

export const getSuggestions = async (
	query: string,
	country: string
): Promise<SuggestionItem[]> => {
	if (abortController) abortController.abort()
	const localController = new AbortController()
	abortController = localController
	try {
		const data = await fetch(
			SearchConfig.suggestions
				.replace('%s', query.trim() === '' ? ' ' : query)
				.replace('%c', country),
			{
				signal: localController.signal
			}
		)
			.then((t) => t.text())
			.then((t) => t.split('[')[2].split(']')[0])
			.then((t) => JSON.parse(`[${t}]`))

		return data.map((item: any) => ({
			query: item.q,
			title: item.name,
			description: item.desc,
			image: item.img
		}))
	} catch (e) {
		if ((e as any)?.name === 'AbortError') return []
		console.error(e)
	}
	return []
}
