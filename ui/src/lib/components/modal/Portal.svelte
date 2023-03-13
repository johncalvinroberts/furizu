<script lang="ts">
	import { onMount } from "svelte";

	let ref: HTMLDivElement;
	onMount(() => {
		// Create and append a DOM node to `document.body`
		// and render the component into it.
		let portal = document.createElement("div");
		portal.setAttribute("data-svelte-dialog-portal", "true");
		document.body.appendChild(portal);
		portal.appendChild(ref);
		return () => {
			document.body.removeChild(portal);
		};
	});
</script>

<div bind:this={ref} class="portal">
	<slot />
</div>

<style>
	.portal {
		position: fixed;
		z-index: var(--z-index-popover);
	}
</style>
