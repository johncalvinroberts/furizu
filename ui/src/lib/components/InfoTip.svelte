<script lang="ts">
	import Tooltip from "./Tooltip.svelte";
	export let title = "";
</script>

<div class="box vertical-center">
	<Tooltip {title} class="infotip">
		<small>?</small>
	</Tooltip>
</div>

<style>
	.box {
		position: relative;
		width: 18px;
		height: 18px;
		border: solid 1px var(--dark);
		border-radius: 50%;
		cursor: pointer;
	}

	.box:hover {
		background: var(--dark);
		color: var(--light);
	}

	small {
		line-height: 0;
	}

	:global(.infotip) {
		flex: 1;
		text-align: center;
		line-height: 0;
	}
</style>
