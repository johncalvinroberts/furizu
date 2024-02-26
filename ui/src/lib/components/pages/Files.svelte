<script lang="ts">
	import { onMount } from "svelte";
	import { blobsStore } from "../../stores/blobs";
	import Processing from "../Processing.svelte";
	import RedirectUnauthenticated from "../RedirectUnauthenticated.svelte";
	import BlobItemTitle from "../BlobItemTitle.svelte";

	const { store } = blobsStore;
	$: blobs = Array.from($store.blobs).map(([, item]) => item);

	onMount(() => blobsStore.getBlobs());
</script>

<RedirectUnauthenticated>
	<div class="list">
		{#if !$store.isLoadingBlobs && $store.isInitialized && blobs.length < 1}
			<div>No files saved yet.</div>
			<a href="/">Go upload some files</a>
		{/if}
		{#if $store.isLoadingBlobs && !$store.isInitialized}
			<Processing />
		{:else}
			{#each blobs as file}
				<a class="list-item" href="/files/{file.id}">
					<span class="blob-title">
						<BlobItemTitle {file} center={false} />
					</span>
				</a>
			{/each}
		{/if}
	</div>
</RedirectUnauthenticated>

<style>
	.list-item {
		margin-bottom: calc(var(--spacing) * 2);
		display: block;
	}
	.blob-title {
		display: inline-block;
		width: 100%;
	}

	.list {
		width: 100%;
	}
</style>
