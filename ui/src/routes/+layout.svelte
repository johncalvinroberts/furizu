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
	import Toy from "../lib/components/Toy.svelte";
	import OverlayLoading from "../lib/components/OverlayLoading.svelte";
	import Messages from "../lib/components/Messages.svelte";

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
			label: "Authenticate",
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
			Icon: End,
			label: "End Session",
			onClick: () => apiClient.endSession(),
			isVisible: isAuthenticated,
		},
	];

	// TODO: make this isomorphic + no FOUC
	onMount(() => display.init());
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
		{#if $apiClientStore.isAuthLoading}
			<OverlayLoading height={"312px"} />
		{/if}
		<div class="form-wrapper">
			<WhoamiForm />
		</div>
	</Modal>
{/if}

<main bind:this={returnFocusElement} class="bg-grid">
	<slot />
</main>

<Toy />
<Messages />

<style>
	nav {
		background-color: var(--gray);
		height: var(--nav-height);
		width: 100%;
		display: flex;
		justify-content: space-between;
		padding: 0 calc(var(--spacing) * 4);
		border-bottom: solid 1px var(--dark);
	}

	main {
		position: relative;
		padding: calc(var(--spacing) * 4);
		min-height: calc(100vh - var(--nav-height));
		display: flex;
	}

	:global(.whoami-modal-card) {
		min-width: 400px;
		padding: var(--spacing);
	}

	.form-wrapper {
		padding: var(--spacing);
	}
</style>
