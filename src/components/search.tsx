import {
	createSignal,
	createMemo,
	createEffect,
	For,
	onMount,
	onCleanup
} from 'solid-js'
import {
	getSuggestions,
	getBangsSuggestions,
	type SuggestionItem
} from '../fetch'
import { SearchConfig } from '../config'
import Svg from './svg'
import { LucideX, LucideSearch, Gemini } from '../assets/svg'
import './search.css'

const BANGS_REGEX = /!([^\s]+)/
const extractBangs = (query: string) => {
	if (!query.startsWith('!')) return
	const match = query.match(BANGS_REGEX)
	if (!match) return
	return match[0]
}

const qSelInput = () =>
	document.querySelector('.search-input') as HTMLInputElement | null

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export default function Search() {
	const [query, setQuery] = createSignal('')
	const [fallbackQuery, setFallbackQuery] = createSignal('')
	const [fetching, setFetching] = createSignal(false)
	const [results, setResults] = createSignal<SuggestionItem[]>([])
	const [cache, setCache] = createSignal<Map<string, SuggestionItem[]>>(
		new Map()
	)
	const [showSuggestions, setShowSuggestions] = createSignal(false)
	const [selectedIndex, setSelectedIndex] = createSignal(-1)

	let country: string | undefined

	const fetchSuggestions = async () => {
		let term = query()
		const cached = cache()

		const updateResults = (k: string, v: SuggestionItem[]) => {
			if (v.length == 0) return // keep old results to prevent layout shift on error (e.g. abort signal)
			setCache(new Map(cached).set(k, v))
			setResults(v)
		}

		// if (!term || term.trim() === "") return;
		if (!term) return

		if (isBangs()) {
			let keyword = extractBangs(term)
			if (term === '!') keyword = '!'
			if (!keyword) return
			if (cached.has(keyword)) {
				setResults(cached.get(keyword)!)
				return
			}
			setFetching(true)
			updateResults(keyword, await getBangsSuggestions(keyword))
			setFetching(false)
			return
		}

		if (isBangsSubSearch()) term = term.replace(BANGS_REGEX, '').trim()

		if (cached.has(term)) {
			setResults(cached.get(term)!)
			return
		}

		// if (isBangsSubSearch() && term == "") setResults([]);

		setFetching(true)
		updateResults(term, await getSuggestions(term, country || 'all'))
		setFetching(false)
	}

	const isBangs = createMemo(
		() => query().startsWith('!') && query().split(' ').length == 1
	)
	const isBangsSubSearch = createMemo(
		() =>
			query().startsWith('!') &&
			query().split(' ')[0] != '!' &&
			query().split(' ').length > 1
	)
	const isBangsView = createMemo(
		() =>
			isBangs() && selectedIndex() != -1 && selectedIndex() != length - 1
	)

	const isSuggestionsVisible = createMemo(() => {
		return showSuggestions() && query().length > 0 && results().length > 0
	})

	const handleInput = (e: Event) => {
		// @ts-ignore
		const value: string = e.target.value
		setFallbackQuery(value)
		setQuery(value)
		setShowSuggestions(value.length > 0)
		setSelectedIndex(-1)
		fetchSuggestions()
	}

	const handleFocus = () => {
		document.body.classList.add('search-focused')
		query().length > 0 && setShowSuggestions(true)
	}

	const handleClear = () => {
		setQuery('')
		setFallbackQuery('')
		handleClose()
		setResults([])
	}

	const handleSelect = (item: SuggestionItem, click: boolean = false) => {
		if (fetching()) return
		if (isBangs()) {
			const s = click ? item.phrase + ' ' : item.phrase + ''
			/*
            if (click && query() == s) {
                handleSearch();
                return;
            }
            */
			setQuery(s)
			if (click) {
				setFallbackQuery(query())
				setSelectedIndex(-1)
				fetchSuggestions() // test
				qSelInput()?.focus()
			}

			return
		}

		if (!item.query) return

		setQuery(
			isBangsSubSearch()
				? `${extractBangs(query())} ${item.query}`
				: item.query
		)

		click && handleSearch()
	}

	const handleSearch = async (ai = false) => {
		const url = SearchConfig[
			ai ? 'queryai' : isBangsSubSearch() ? 'querybangs' : 'query'
		]
			.replace('%s', query())
			.replace('%c', country || 'all')

		// not sure if this will help redirect faster
		const link = document.createElement('link')
		link.rel = 'prefetch'
		link.href = url
		document.head.appendChild(link)

		handleClose()
		await sleep(100)
		window.location.href = url
	}

	const handleClose = () => {
		document.body.classList.remove('search-focused')
		setSelectedIndex(-1)
		setShowSuggestions(false)
	}

	const handleInputKeybind = (event: KeyboardEvent) => {
		if (!query() || query().trim() === '') return
		// if (isBangs() && results().length != 0) return;
		if (!['Enter', 'NumpadEnter'].includes(event.code)) return
		if (isBangsView()) {
			setQuery((prev) => prev + ' ')
			setFallbackQuery(query())
			setSelectedIndex(-1)
			fetchSuggestions() // test
			return
		}
		if (event.altKey || selectedIndex() == results().length) {
			handleSearch(true)
			return
		}
		handleSearch()
	}

	onMount(() => {
		const handleClickOutside = (event: MouseEvent) =>
			!event
				.composedPath()
				.find(
					(node) =>
						node instanceof HTMLElement &&
						node.classList &&
						node.classList.contains('search-container')
				) && handleClose()
		/*
            // @ts-ignore
            !event.currentTarget.closest(".search-container") && handleClose();
        */
		const handleInputOnce = (event: KeyboardEvent) => {
			const validKey =
				event.ctrlKey ||
				event.code.startsWith('Key') ||
				event.code.startsWith('Digit') ||
				[
					'Escape',
					'Enter',
					'NumpadEnter',
					'ShiftLeft',
					'Space'
				].includes(event.code)
			const input = qSelInput()
			if (input == document.activeElement && validKey) {
				document.body.classList.add('search-focused')
			} else {
				input?.blur()
			}
		}
		const handleKeybind = (event: KeyboardEvent) => {
			if (fetching()) return
			if (event.code == 'Escape') {
				handleClose()
				qSelInput()?.blur()
				event.preventDefault()
				return
			}
			if (showSuggestions()) {
				// no more bugs pls 😭
				const sel = selectedIndex()
				const rLength = results().length
				const length = rLength + 3 // Gemini, Search Button, Search Box

				const setIndex = (fn: (prev: number) => number) => {
					event.preventDefault()
					setSelectedIndex(fn)
				}
				if (event.code == 'ArrowDown' || event.code == 'Tab')
					setIndex((prev: number) => (prev + 1) % length)
				else if (event.code == 'ArrowUp')
					setIndex((prev) => (prev - 1 + length) % length)
				else if (
					(event.code == 'ArrowLeft' || event.code == 'ArrowRight') &&
					(sel == rLength || sel == rLength + 1)
				)
					// L-R footer btn
					setIndex((prev) => (prev == rLength ? prev + 1 : prev - 1))
				else if (event.code == 'ArrowLeft' && isBangsView())
					setIndex(
						(prev) => (prev + Math.floor(rLength / 2)) % rLength
					)
				else if (event.code == 'ArrowRight' && isBangsView())
					setIndex(
						(prev) =>
							(prev - Math.floor(rLength / 2) + rLength) % rLength
					)

				if (selectedIndex() >= rLength) setQuery(fallbackQuery())
				return
			}
			if (
				event.code == 'Tab' ||
				(qSelInput() != document.activeElement && event.code == 'Space')
			) {
				event.preventDefault()
				qSelInput()?.focus()
			}
		}
		country = localStorage.getItem('country') || 'all'
		document.addEventListener('keydown', handleInputOnce, { once: true })
		document.addEventListener('keydown', handleKeybind)
		document.addEventListener('click', handleClickOutside)
		onCleanup(() => {
			document.removeEventListener('keydown', handleKeybind)
			document.removeEventListener('click', handleClickOutside)
		})
	})

	return (
		<div class="search-container" classList={{ open: showSuggestions() }}>
			<div class="search-box">
				<input
					type="text"
					name="search-input"
					class="search-input"
					placeholder="Ask anything, find anything..."
					value={query()}
					onInput={handleInput}
					onFocus={handleFocus}
					onKeyDown={handleInputKeybind}
					autocomplete="off"
					autocorrect="off"
					autocapitalize="none"
					spellcheck="false"
					autofocus
				/>
				<button
					class="clear-btn"
					aria-label="Clear search"
					classList={{ visible: query().length > 0 }}
					onClick={handleClear}
				>
					<Svg raw={LucideX} />
				</button>
			</div>

			<ul
				class="suggestions"
				classList={{
					bangs: isBangs()
				}}
			>
				{isBangsSubSearch() &&
					(() => {
						const bang = extractBangs(query())?.trim()
						if (!bang) return
						const items = cache().get(bang)
						if (!items) return
						const item = items.find((v) => v.phrase == bang)
						if (!item) return
						const [showFallback, setShowFallback] =
							createSignal(false)
						const q = query().replace(BANGS_REGEX, '').trim()
						return (
							<li
								onClick={() => handleSearch()}
								class="bang-notice"
							>
								<div class="item-img-wrapper">
									{item.image && !showFallback() ? (
										<img
											src={item.image}
											onError={() =>
												setShowFallback(true)
											}
										/>
									) : (
										<Svg
											raw={LucideSearch}
											width="20px"
											height="20px"
										/>
									)}
								</div>
								<div class="item-text-wrapper">
									<span class="item-title">{item.title}</span>
									<span class="item-desc">
										Search {item.title} for{' '}
										{q.length == 0 ? '...' : `"${q}"`}
									</span>
								</div>
							</li>
						)
					})()}
				<For each={results()}>
					{(item, index) => {
						const [showFallback, setShowFallback] =
							createSignal(false)
						createEffect(
							() =>
								selectedIndex() == index() && handleSelect(item)
						)
						return (
							<li
								onClick={() => handleSelect(item, true)}
								classList={{
									active: selectedIndex() == index()
								}}
							>
								{isBangs() ? (
									<>
										<div class="col-left">
											{item.image && !showFallback() ? (
												<img
													src={item.image}
													onError={() =>
														setShowFallback(true)
													}
												/>
											) : (
												<span class="no-image">
													N/A
												</span>
											)}
										</div>
										<div class="col-middle">
											{item.title}
										</div>
										<div class="col-right">
											{item.phrase || ''}
										</div>
									</>
								) : (
									<>
										<div class="item-img-wrapper">
											{item.image && !showFallback() ? (
												<img
													src={item.image}
													onError={() =>
														setShowFallback(true)
													}
												/>
											) : (
												<Svg
													raw={LucideSearch}
													width="20px"
													height="20px"
												/>
											)}
										</div>
										<div class="item-text-wrapper">
											<span class="item-title">
												{item.title || item.query}
											</span>
											{item.description && (
												<span class="item-desc">
													{item.description}
												</span>
											)}
										</div>
									</>
								)}
							</li>
						)
					}}
				</For>
			</ul>

			<div class="suggestions-footer">
				<button
					class="gemini-btn"
					classList={{
						active: selectedIndex() == results().length
					}}
					onClick={() => handleSearch(true)}
				>
					<Svg raw={Gemini} width="22px" height="22px" />
					Ask Gemini
				</button>
				<span class="gemini-tips">Alt+Enter</span>
				<button
					class="search-btn"
					classList={{
						active: selectedIndex() == results().length + 1
					}}
					disabled={!query()}
					onClick={() => handleSearch()}
				>
					Search
				</button>
			</div>
		</div>
	)
}
