<script lang="ts">
	import { display } from "../stores/display";
	import Message from "./Message.svelte";
	const { store } = display;
	$: bottom = 30 + $store.messages.length * 20;
</script>

{#each $store.messages as message, offset}
	<Message {message} {offset} />
{/each}

<style>
</style>
