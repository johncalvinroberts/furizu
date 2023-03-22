<script>
	import { onDestroy, onMount } from "svelte";
	import { delay } from "../utils";
	export let height = "100vh";
	let className = "";
	export { className as class };

	let progress = 0;
	let keepGoing = true;

	const go = async () => {
		if (!keepGoing) return;
		const ms = progress * 1.4 * 50;
		await delay(ms);
		progress++;
		go();
	};

	const stop = () => (keepGoing = false);
	onMount(() => go());
	onDestroy(() => stop());
</script>

<div class="overlay vertical-center {className}" style="height: {height};">
	<div class="vertical-center">
		<div class="bar">
			<div class="progress" style="width: {progress}%" />
		</div>
		<h3>Loading</h3>
	</div>
</div>

<style>
	.overlay {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		background-color: var(--opaque);
		width: 100%;
		z-index: 9999;
		padding: 20px;
	}
	.bar {
		width: 100%;
		height: var(--nav-height);
		position: relative;
		z-index: 99999;
	}
	.progress {
		height: calc(var(--nav-height) * 2);
		left: 0;
		top: 0;
		background-color: var(--dark);
	}
</style>
