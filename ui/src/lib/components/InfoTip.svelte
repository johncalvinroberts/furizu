<script lang="ts">
	import Tooltip from "./Tooltip.svelte";
	export let title: string;
</script>

<Tooltip {title} class="infotip vertical-center">
	<small>?</small>
</Tooltip>

<style>
	small {
		/* line-height: 0; */
		font-size: var(--font-size-small);
	}

	:global(.infotip) {
		flex: 1;
		text-align: center;
		line-height: 0;
		width: 18px;
		height: 18px;
		border: solid 1px var(--dark);
		cursor: pointer;
		border-radius: 50%;
		position: relative;
	}
	:global(.infotip:hover) {
		background: var(--dark);
		color: var(--light);
	}
</style>
