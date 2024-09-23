// it's just work

async function fetchCSS(url) {
	const response = await fetch(url)
	return response.text()
}
const inlineClasses = new Set()
const useClasses = new Set()
class cssCleaner {
	/**
	 * @param {boolean} isStyle
	 */
	constructor(isStyle) {
		this.isStyle = isStyle
	}
	async element(element) {
		if (this.isStyle) {
			let new_style = element.innerHTML
			const uses_cls = [...useClasses]
			const inl_cls = [...inlineClasses]
			for (const cls of inl_cls) {
				if (!uses_cls.includes(cls)) {
					const regex = new RegExp(`(${cls}\\s*\\{[^}]+\\})`)
					new_style = new_style.replace(regex, '')
				}
			}
		} else {
			if (element.getAttribute('class')) {
				const onElClasses = element.getAttribute('class').split(' ')
				onElClasses.forEach(cls => useClasses.add(cls))
			}
		}
	}
}
class RemoveElementHandler {
	element(element) {
		element.remove()
	}
}
class cssInline {
	constructor(attributeName) {
		this.attributeName = attributeName
	}

	async element(element) {
		const attribute = element.getAttribute(this.attributeName)
		if (attribute) {
			const styles = await fetchCSS(attribute)
			const stylesFontFix = styles.replaceAll(
				'https://uploads-ssl.webflow.com/',
				'https://assets-global.website-files.com/'
			)
			element.replace(`<style replaced>${stylesFontFix}</style>`, {
				html: true,
			})
		}
	}
}

export { fetchCSS, cssCleaner, cssInline, RemoveElementHandler }
