<script lang="ts">
	import type { BlobItem } from "../../types/types";
	import Input from "./form/Input.svelte";
	import Button from "./Button.svelte";
	import InfoTip from "./InfoTip.svelte";

	export let file: BlobItem;
	export let center = true;
	$: url = file?.url;
	$: publicURL = file?.publicURL;

	const handleChangeInput = () => (url = file?.url);
	const handleCopyRawURL = () => navigator.clipboard.writeText(url);
	const handleCopyShareURL = () => {
		navigator.clipboard.writeText(publicURL);
	};
</script>

<div class="blob-preview">
	<slot />
	<div class="vertical-center blob-details" class:not-center={!center}>
		<Input name={file.key} bind:value={publicURL} on:change={handleChangeInput} />
		<Button
			class="copy-button"
			on:click={handleCopyShareURL}
			title="Copy shareable public URL to clipboard"
		>
			Copy Share URL
		</Button>
		<div>
			<InfoTip
				title="Copy a shareable public link to your clipboard. The link can be sent to anyone you want to share the file with <br/> The recipient will be prompted for the secret key for the file."
			/>
		</div>
		<div class="vertical-center" class:not-center={!center}>
			<Input name={file.key} bind:value={url} on:change={handleChangeInput} />
			<Button class="copy-button" on:click={handleCopyRawURL} title="Copy Raw URL to clipboard">
				Copy Raw URL
			</Button>
			<div>
				<InfoTip
					title="Copy the URL of the raw encrypted file. Back up the encrypted file anywhere you want, and decrypt it by dropping it back in Furizu."
				/>
			</div>
		</div>
	</div>
</div>

<style>
	.blob-preview {
		flex-wrap: wrap;
		display: flex;
		max-width: 400px;
	}

	.blob-details {
		flex: 0 0 100%;
	}

	.not-center {
		justify-content: flex-start;
	}

	:global(.copy-button) {
		margin: 0 var(--spacing);
	}
</style>
