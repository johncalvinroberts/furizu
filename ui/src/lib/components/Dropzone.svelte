<script lang="ts">
	import FileDrop from "filedrop-svelte";
	import { encrypter } from "../stores/encrypter";
	import AnimatedPlus from "./AnimatedPlus.svelte";
	import { browser } from "$app/environment";

	const { handleFiles } = encrypter;
	let isDraggingOver = false;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleDrop = (e: any) => {
		return handleFiles(e.detail.files.accepted);
	};
</script>

<div>
	{#if browser}
		<FileDrop
			on:filedrop={handleDrop}
			on:dragover={() => (isDraggingOver = true)}
			on:dragleave={() => (isDraggingOver = false)}
		>
			<div
				class="dropzone"
				class:is-dragging-over={isDraggingOver}
				on:mouseover={() => (isDraggingOver = true)}
				on:mouseleave={() => (isDraggingOver = false)}
				on:focus={() => (isDraggingOver = true)}
			>
				<AnimatedPlus {isDraggingOver} />
			</div>
		</FileDrop>
	{:else}
		<div class="dropzone">
			<AnimatedPlus {isDraggingOver} />
		</div>
	{/if}

	<small> Drop Files or Folders to Get Started </small>
</div>

<style>
	.dropzone {
		text-align: center;
		color: var(--dark);
		padding: 2rem 1rem;
		width: 100%;
		background-color: var(--yellow);
		margin-bottom: var(--spacing);
		transition: padding cubic-bezier(0.075, 0.82, 0.165, 1) 0.2s;
		cursor: pointer;
	}
	.dropzone:hover {
		padding: 3rem 1rem;
	}
	.is-dragging-over {
		padding: 3rem 1rem;
	}
	small {
		text-align: center;
		display: block;
	}
</style>
