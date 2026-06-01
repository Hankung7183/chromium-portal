// @ts-ignore
const data = await fetch('https://www.msn.com/weather').then((e) => e.text())
const matches = data.match(/"detectedLocation":\{[^}]*\}/g)
if (matches) {
	const json = JSON.parse(matches[0].replace(`"detectedLocation":`, ''))
	const latitude = json['latitude']
	const longitude = json['longitude']
	console.log(latitude, longitude)
}
