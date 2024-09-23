import page410 from './page410.html'
import { cssInline, RemoveElementHandler } from './cssWork.js'
import { redList301, redList410 } from './redirects.js'

/*
 * Installation TODO:
 *  - change var 'isWWW'. if host must contain WWW set true
 *  - fill lists in redirects.js
 *  - change href to homepage in page410.html
 *  - (optional) in cssWork.js change replaceAll(...) to specific fonts | ! need tests for current realization !
 */

/*
 * if u want:
 * - change/append redirect -> go to redirects.js
 * - something else -> ask dev
 */

// Check/change
const isWWW = false

async function redirectPage(request) {
	// get url
	const url = new URL(request.url)
	// get main params
	let { pathname, host, search } = url
	// check www and edit
	if (!isWWW) host = host.replace('www.', '')
	// update pathname for 410
	pathname = pathname + search

	// search 410 equals
	const red410 = redList410.find(
		x => x.replaceAll('/', '') === pathname.replaceAll('/', '')
	)
	// if find -> return 410 page
	if (red410) {
		return new Response(page410, {
			status: 410,
			headers: {
				'Content-Type': 'text/html',
			},
		})
	}

	// search 301 equals
	const red301 = redList301.find(
		x => x.from.replaceAll('/', '') === pathname.replaceAll('/', '')
	)
	// if find -> return 301 page
	if (red301) {
		return Response.redirect('https://' + host + red301.to, 301)
	}

	/*
	 * Basic Redirects:
	 * http: -> https:
	 * www -> non-www
	 */

	// check WWW and http. work like 'Always use HTTPS'
	if ((url.host.includes('www') && !isWWW) || url.protocol === 'http:') {
		return Response.redirect('https://' + host + pathname, 301)
	}

	// default return
	return fetch(request)
}

// not set nofollow links
const EXCEPTION_LINKS = ['google', 'twitter', 'facebook', 'youtube']

class ExternalLinksHandler {
	async element(element) {
		const href = element.getAttribute('href')
		EXCEPTION_LINKS.forEach(link => {
			if (!href.includes(link)) {
				element.setAttribute('rel', 'nofollow noopener noreferrer')
			}
		})
	}
}

// clean page
async function cleanPage(response) {
	// find external links and set nofollow rel
	const externalLinks = new HTMLRewriter()
		.on('a[target="_blank"]:not([rel])', new ExternalLinksHandler())
		.transform(response)

	// remove hidden elements with class 'w-condition-invisible'
	const hiddenRemove = new HTMLRewriter()
		.on('.w-condition-invisible', new RemoveElementHandler())
		.transform(externalLinks)
	// unpack loaded styles to inline
	return new HTMLRewriter()
		.on('link[rel="stylesheet"]', new cssInline('href'))
		.transform(hiddenRemove)
}

export default {
	async fetch(request) {
		const response = await redirectPage(request)
		return cleanPage(response)
	},
}
