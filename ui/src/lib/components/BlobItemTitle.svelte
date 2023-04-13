<script lang="ts">
	import type { BlobItem } from "../../types/types";
	import FileSize from "./FileSize.svelte";
	export let file: BlobItem;
	export let center = true;
</script>

<div class="blob-title" class:not-center={!center}>
	<span class="truncate title-text">
		{file.title} -
	</span>
	<FileSize bytes={file.sizeBytes} class="file-size" />
</div>

<style>
	.blob-title {
		flex: 0 0 100%;
		display: flex;
		justify-content: center;
	}

	.blob-title.not-center {
		justify-content: flex-start;
	}

	.blob-title .title-text {
		max-width: 200px;
		display: block;
	}
</style>
