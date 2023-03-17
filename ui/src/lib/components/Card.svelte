<script lang="ts">
	import { draggable } from "@neodrag/svelte";
	export let isDraggable = false;
	let className = "";
	export { className as class };
</script>

{#if isDraggable}
	<div class={`card ${className || ""}`} use:draggable>
		<slot />
	</div>
{/if}

{#if !isDraggable}
	<div class={`card ${className || ""}`}>
		<slot />
	</div>
{/if}

<style>
	.card {
		background-color: var(--light);
		box-shadow: var(--boxy-shadow);
		border: solid 1px var(--dark);
	}
</style>
