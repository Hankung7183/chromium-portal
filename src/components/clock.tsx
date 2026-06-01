import { createSignal, onMount, onCleanup } from 'solid-js'
import './clock.css'

export default function Clock(props: { date: Date }) {
	const [time, setTime] = createSignal<Date>(props.date)

	onMount(() => {
		const interval = setInterval(() => {
			setTime(new Date())
		}, 1000)

		onCleanup(() => clearInterval(interval))
	})

	return (
		<div class="time">
			{time().toLocaleTimeString('en-US', {
				hour: '2-digit',
				minute: '2-digit',
				hour12: false
			})}
		</div>
	)
}
