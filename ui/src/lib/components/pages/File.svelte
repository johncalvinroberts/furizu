<script lang="ts">
	export let file: BlobItem;
	import type { BlobItem } from "../../../types/types";
	import BlobItemComponent from "../BlobItem.svelte";
	import FileSize from "../FileSize.svelte";
	import RedirectUnauthenticated from "../RedirectUnauthenticated.svelte";
	import { formatDate } from "$lib/utils";
	const createdAt = formatDate(file.createdAt * 1000);
</script>

<RedirectUnauthenticated>
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
</RedirectUnauthenticated>

<style>
	/* Your styles here */
</style>
