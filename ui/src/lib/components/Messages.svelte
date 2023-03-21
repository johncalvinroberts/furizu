<script lang="ts">
	import { display } from "../stores/display";
	import Message from "./Message.svelte";
	const { store } = display;
</script>

{#each $store.messages as message, offset}
	<Message {message} {offset} />
{/each}
