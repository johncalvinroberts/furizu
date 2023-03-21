<script lang="ts">
	import { display } from "../stores/display";

	let online = true;
	$: if (!online) display.enqueueMessage("You're offline", "error");
</script>

<svelte:window bind:online />

<style>
	/* styles */
</style>
