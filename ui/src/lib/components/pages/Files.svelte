<script lang="ts">
	import { onMount } from "svelte";
	import { blobsStore } from "../../stores/blobs";
	import BlobItem from "../BlobItem.svelte";
	import Processing from "../Processing.svelte";
	import RedirectUnauthenticated from "../RedirectUnauthenticated.svelte";

	const { store } = blobsStore;
	$: blobs = Array.from($store.blobs).map(([, item]) => item);

	onMount(() => blobsStore.getBlobs());
</script>

<RedirectUnauthenticated>
	<div>
		{#if $store.isLoadingBlobs && !$store.isInitialized}
			<Processing />
		{:else}
			{#each blobs as file}
				<div>
					<BlobItem {file} />
				</div>
			{/each}
		{/if}
	</div>
</RedirectUnauthenticated>

<style>
	/* styles */
</style>
