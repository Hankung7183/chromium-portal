// https://raw.githubusercontent.com/kagisearch/bangs/refs/heads/main/data/bangs.schema.json
interface Bang {
	/** The name of the website associated with the bang. */
	s: string
	/** The domain name of the website. */
	d: string
	/** The domain of the actual website if the bang searches another website, if applicable. For use by snaps. */
	ad?: string
	/** The specific trigger word or phrase used to invoke the bang. */
	t: string
	/** Other triggers for this bang other than the primary. */
	ts?: string[]
	/** The URL template to use when the bang is invoked, where `{{{s}}}` is replaced by the user's query. */
	u: string
	/** Regex pattern that can be used for parsing the query for more complex bangs, allowing substitution using `$1`, `$2`, etc. */
	x?: string
	/** The category of the website, if applicable. */
	c?:
		| 'Entertainment'
		| 'Man Page'
		| 'Multimedia'
		| 'News'
		| 'Online Services'
		| 'Region search'
		| 'Research'
		| 'Shopping'
		| 'Tech'
		| 'Translation'
	/** The subcategory of the website, if applicable. */
	sc?: string
	/** The format flags indicating how the query should be processed. */
	fmt?: (
		| 'open_base_path'
		| 'open_snap_domain'
		| 'url_encode_placeholder'
		| 'url_encode_space_to_plus'
	)[]
	/** Whether specs should be run on this bang. */
	skip_tests?: boolean
}
