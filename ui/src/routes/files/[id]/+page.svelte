<script lang="ts">
	export let data: { id: string };
	import Processing from "$lib/components/Processing.svelte";
	import RedirectUnauthenticated from "$lib/components/RedirectUnauthenticated.svelte";
	import File from "../../../lib/components/pages/File.svelte";
	import { blobsStore } from "$lib/stores/blobs";
	import { onMount } from "svelte";
	const { store } = blobsStore;
	let isLoading = false;
	let isFailure = false;
	let isLoadedOnce = false;
	$: file = $store.blobs.get(data.id);
	const getBlob = async () => {
		try {
			isLoading = true;
			isLoadedOnce = true;
			await blobsStore.getBlob(data.id);
		} catch (error) {
			isFailure = true;
		} finally {
			isLoading = false;
		}
	};
	onMount(() => getBlob());
</script>

<RedirectUnauthenticated>
	{#if isLoading}
		<Processing />
	{:else if (isLoadedOnce && !file && !isLoading) || isFailure}
		<div>Not found</div>
	{:else if file}
		<File {file} />
	{/if}
</RedirectUnauthenticated>
