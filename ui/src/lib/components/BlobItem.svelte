<script lang="ts">
	import type { BlobItem } from "../../types/types";
	import FileSize from "./FileSize.svelte";
	import Input from "./form/Input.svelte";
	import Button from "./Button.svelte";
	import InfoTip from "./InfoTip.svelte";

	export let file: BlobItem;
	export let center = true;
	$: url = file?.url;

	const handleChangeInput = () => (url = file?.url);
	const handleCopyRawURL = () => navigator.clipboard.writeText(file.url);
	const handleCopyShareURL = () => {
		// TODO
	};
</script>

<div class="blob-preview">
	<div class="blob-title">
		<span class="truncate title-text">
			{file.title} -
		</span>
		<FileSize bytes={file.sizeBytes} class="file-size" />
	</div>
	<div class="vertical-center" class:not-center={!center}>
		<Input name={file.key} bind:value={url} on:change={handleChangeInput} />
		<Button class="copy-button" on:click={handleCopyRawURL} title="Copy Raw URL to clipboard">
			Copy Raw URL
		</Button>
		<div>
			<InfoTip
				title="Copy the URL of the raw encrypted file. You can store this wherever you want, and decrypt it by dropping it back in Furizu."
			/>
		</div>
	</div>
	<div class="vertical-center" class:not-center={!center}>
		<Input name={file.key} bind:value={url} on:change={handleChangeInput} />
		<Button
			class="copy-button"
			on:click={handleCopyShareURL}
			title="Copy shareable public URL to clipboard"
		>
			Copy Share URL
		</Button>
		<div>
			<InfoTip
				title="Copy a shareable public link to your clipboard. The link can be sent to anyone you want to share the file with, and will be prompted for the secret key for the file."
			/>
		</div>
	</div>
</div>

<style>
	.blob-preview {
		flex-wrap: wrap;
	}
	.blob-title {
		flex: 0 0 100%;
		display: flex;
	}

	.blob-title .title-text {
		max-width: 200px;
		display: block;
	}

	.not-center {
		justify-content: flex-start;
	}

	:global(.copy-button) {
		margin: 0 var(--spacing);
	}
</style>
