<script lang="ts">
	import { onDestroy } from "svelte";
	import { getRandomUnicodeString } from "../utils";
	import OverlayLoading from "./OverlayLoading.svelte";
	const CHAR_AMT = 25;

	let randomChars = [
		getRandomUnicodeString(CHAR_AMT),
		getRandomUnicodeString(CHAR_AMT),
		getRandomUnicodeString(CHAR_AMT),
		getRandomUnicodeString(CHAR_AMT),
		getRandomUnicodeString(CHAR_AMT),
		getRandomUnicodeString(CHAR_AMT),
		getRandomUnicodeString(CHAR_AMT),
		getRandomUnicodeString(CHAR_AMT),
		getRandomUnicodeString(CHAR_AMT),
		getRandomUnicodeString(CHAR_AMT),
		getRandomUnicodeString(CHAR_AMT),
	];
	const shiftString = () => {
		const nextRandomChars = [getRandomUnicodeString(CHAR_AMT)];
		for (let i = 0; i < randomChars.length - 1; i++) {
			const nextStringArr = randomChars[i].split("");
			for (let j = 0; j < 4; j++) {
				const randomIndex = Math.floor(Math.random() * CHAR_AMT);
				nextStringArr[randomIndex] = getRandomUnicodeString(1);
			}
			nextRandomChars.push(nextStringArr.join(""));
		}
		randomChars = nextRandomChars;
	};
	const interval = setInterval(shiftString, 100);
	onDestroy(() => clearInterval(interval));
</script>

<div class="box vertical-center">
	<OverlayLoading height="200px" class="processing-overlay" />
	<div class="bar truncate">
		{#each randomChars as row}
			<div>
				{row}
			</div>
		{/each}
	</div>
</div>

<style>
	.box {
		position: relative;
		width: 100%;
		/* margin-top: -20px; */
	}
	.bar {
		background-color: var(--light);
		color: var(--dark);
		width: 100%;
		text-align: center;
		transition: all 0.2s ease;
		position: absolute;
		left: 0;
		right: 0;
		z-index: var(--z-index-popover);
	}
	:global(.processing-overlay) {
		margin-top: -77px;
	}
</style>
