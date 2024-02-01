<script lang="ts">
	export let data: { key: string };
	import Processing from "$lib/components/Processing.svelte";
	import File from "../../../lib/components/pages/File.svelte";
	import { blobsStore } from "$lib/stores/blobs";
	import { onMount } from "svelte";
	const { store } = blobsStore;
	$: file = $store.blobs.get(data.key);
	onMount(() => blobsStore.getBlobs());
	console.log({ file });
</script>

{#if $store.isLoadingBlobs}
	<Processing />
{:else if !file && !$store.isLoadingBlobs}
	<div>Not found</div>
{:else if file}
	<File {file} />
{/if}
