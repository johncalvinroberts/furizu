<script lang="ts">
	export let file: BlobItem;
	import type { BlobItem } from "../../../types/types";
	import BlobItemComponent from "../BlobItem.svelte";
	import FileSize from "../FileSize.svelte";
	import { formatDate } from "$lib/utils";
	const createdAt = formatDate(new Date(file.createdAt).valueOf());
</script>

<div>
	<h2>{file.title}</h2>
	<li>
		Size: <FileSize bytes={file.sizeBytes} />
	</li>
	<li>
		Created: {createdAt}
	</li>
	<BlobItemComponent {file} />
</div>

<style>
	/* Your styles here */
</style>
