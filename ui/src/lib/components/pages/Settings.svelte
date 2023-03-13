<script lang="ts">
	import Button from "../Button.svelte";
	import ThemeSwitch from "../ThemeSwitch.svelte";
	import { apiClient } from "../../stores/api";
	const back = "<-";
</script>

<div>
	<section />
	<a href="/">
		<span class="arrow">
			{back}
		</span>
		Home
	</a>
	<ThemeSwitch />
	<section>
		<Button on:click={apiClient.endSession}>End Session</Button>
	</section>
</div>

<style>
	.arrow {
		transform: rotate(90deg);
	}
	a {
		margin-bottom: calc(var(--spacing) * 2);
		display: block;
	}
	section {
		padding: calc(var(--spacing) * 2) 0;
	}
	section:first-child {
		padding-top: 0;
	}
</style>
