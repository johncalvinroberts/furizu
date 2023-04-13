<script lang="ts">
	import { saveAs } from "file-saver";
	import { getEncryptedFilename } from "../utils";
	import { encrypter } from "../stores/encrypter";
	import Check from "./icons/Check.svelte";
	import Button from "./Button.svelte";
	import BlobItem from "./BlobItem.svelte";
	import BlobItemTitle from "./BlobItemTitle.svelte";

	const { store, reset } = encrypter;
	const type = $store.decryptedFiles ? "decrypted" : "encrypted";

	let isFailToDownload = false;

	const downloadEncrypted = () => {
		isFailToDownload = false;
		try {
			if (!$store.files || !$store.crypString) {
				throw new Error("Cannot create download");
			}
			const fileName = getEncryptedFilename($store.files);
			const file = new File([$store.crypString], fileName);
			saveAs(file);
		} catch (error) {
			isFailToDownload = true;
			console.error(error);
		}
	};

	const downloadDecrypted = () => {
		isFailToDownload = false;
		try {
			if (!$store.decryptedFiles) {
				throw new Error("Cannot create download");
			}
			for (const file of $store.decryptedFiles) {
				saveAs(file, file.name);
			}
		} catch (error) {
			isFailToDownload = true;
			console.error(error);
		}
	};

	const handleDownload = () => (type === "encrypted" ? downloadEncrypted() : downloadDecrypted());
</script>

<div>
	<h3 class="vertical-center">
		<span class="icon vertical-center">
			<Check width={40} />
		</span>
		Successfully {type}
	</h3>
	{#if isFailToDownload}
		<div class="error">Failed to Download File.</div>
	{/if}
	{#if $store.successfulBlobItem}
		<BlobItem file={$store.successfulBlobItem} center>
			<BlobItemTitle file={$store.successfulBlobItem} center />
		</BlobItem>
	{/if}
	<div class="bottom-box">
		<Button on:click={handleDownload}>Download Raw</Button>
		<Button on:click={reset}>Start Over</Button>
	</div>
</div>

<style>
	h3 {
		text-align: center;
	}
	.bottom-box {
		margin: 0 auto;
	}

	.icon {
		margin-right: 0.5rem;
	}

	.error {
		color: var(--error);
		text-align: center;
		padding-top: 1rem;
	}
</style>
