<script lang="ts">
	import { onMount } from "svelte";
	import { encrypter } from "../lib/stores/encrypter";
	import { apiClient } from "../lib/stores/api";
	import Dropdown from "../lib/components/Dropdown.svelte";
	import Control from "../lib/components/icons/Control.svelte";
	import Keycaps from "../lib/components/icons/Keycaps.svelte";
	import End from "../lib/components/icons/End.svelte";
	import { display } from "../lib/stores/display";
	import WhoamiForm from "../lib/components/WhoamiForm.svelte";
	import Modal from "../lib/components/modal/Modal.svelte";
	import Messages from "../lib/components/Messages.svelte";
	import Online from "../lib/components/Online.svelte";
	import AuthFocusCheck from "../lib/components/AuthFocusCheck.svelte";
	import Folder from "../lib/components/icons/Folder.svelte";
	import { blobsStore } from "../lib/stores/blobs";
	import initSnow from "$lib/snow/snow";

	let initialFocusElement: HTMLElement;
	let returnFocusElement: HTMLElement;

	const { store: encrypterStore } = encrypter;
	const { store: apiClientStore } = apiClient;
	const { store: displayStore } = display;
	let title = `furizu. | ${$encrypterStore.state}`;
	$: isAuthenticated = $apiClientStore.isAuthenticated;
	$: email = $apiClientStore.email;
	$: dropdownOptions = [
		{
			Icon: Keycaps,
			label: "Login/Signup",
			onClick: () => display.toggleAuthModal(),
			isVisible: !isAuthenticated,
		},
		{
			Icon: Control,
			label: "Settings",
			href: "/settings",
			isVisible: true,
		},
		{
			Icon: Folder,
			label: "Files",
			href: "/files",
			isVisible: isAuthenticated,
		},
		{
			Icon: End,
			label: "End Session",
			onClick: () => apiClient.endSession(),
			isVisible: isAuthenticated,
		},
	];

	// TODO: make this isomorphic + no FOUC
	onMount(() => {
		display.initialize();
		blobsStore.initialize();
		const snow = document.querySelector("#snow");
		initSnow(snow);
	});
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<nav>
	<a href="/" class="vertical-center">
		<span>❆</span>
	</a>
	<Dropdown
		label={isAuthenticated ? email : "Guest"}
		options={dropdownOptions.filter((item) => item.isVisible)}
	/>
</nav>

{#if $displayStore.isAuthModalOpen}
	<Modal onDismiss={() => display.toggleAuthModal()} {returnFocusElement} {initialFocusElement}>
		<div class="form-wrapper">
			<WhoamiForm />
		</div>
	</Modal>
{/if}

<main bind:this={returnFocusElement} class="bg-grid">
	<slot />
</main>

<Messages />
<Online />
<AuthFocusCheck />
<div id="snow"></div>

<style>
	nav {
		background-color: var(--light);
		height: var(--nav-height);
		width: 100%;
		display: flex;
		justify-content: space-between;
		padding: 0 calc(var(--spacing) * 4);
		border-bottom: solid 1px var(--dark);
		z-index: var(--z-index-popover);
		position: relative;
	}

	main {
		position: relative;
		padding: calc(var(--spacing) * 4);
		min-height: calc(100vh - var(--nav-height));
		display: flex;
		z-index: var(--z-index-ui);
		position: relative;
	}

	.form-wrapper {
		padding: var(--spacing);
	}
	#snow {
		display: block;
		position: fixed;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		/* background-color: #0f2027; */
		/* background-image: linear-gradient(to bottom, #0f2027, #080e10); */
		z-index: var(--z-index-bg);
		background-color: var(--accent);
	}
</style>
