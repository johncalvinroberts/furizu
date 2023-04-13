<script lang="ts">
	import { onMount } from "svelte";
	import { blobsStore } from "../../stores/blobs";
	import BlobItem from "../BlobItem.svelte";
	import Processing from "../Processing.svelte";
	import RedirectUnauthenticated from "../RedirectUnauthenticated.svelte";
	import BlobItemTitle from "../BlobItemTitle.svelte";

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
				<details class="list-item">
					<summary>
						<span class="blob-title">
							<BlobItemTitle {file} center={false} />
						</span>
					</summary>
					<BlobItem {file} center={false} />
				</details>
			{/each}
		{/if}
	</div>
</RedirectUnauthenticated>

<style>
	.list-item {
		margin-bottom: calc(var(--spacing) * 2);
	}
	.blob-title {
		display: inline-block;
		width: 224px;
	}
</style>
