export const SearchConfig = {
	// URL with %s in place of query. Only 'query' and 'queryai' are allowed to change unless you know what you are doing.
	query: 'https://search.brave.com/search?q=%s&source=desktop&country=%c',
	queryai: 'https://www.google.com/search?q=%s&udm=50',
	querybangs: 'https://duckduckgo.com/?ia=web&q=%s',
	suggestions:
		'https://search.brave.com/api/suggest?q=%s&rich=true&source=web&country=%c',
	bangs: 'https://duckduckgo.com/ac/?q=%s&kl=wt-wt&vertical=homepage'
}
