<script lang="ts">
	import Encrypter from "../Encrypter.svelte";
	import Card from "../Card.svelte";
	import MacintoshBar from "../MacintoshBar.svelte";
	import Banner from "../Banner.svelte";
	import { encrypter } from "../../stores/encrypter";
	const { store: encrypterStore } = encrypter;
	$: state = $encrypterStore.state;
	$: innerWidth = 0;
</script>

<Card class="encrypter-card" isDraggable>
	<MacintoshBar>
		{state}
	</MacintoshBar>
	<div class="card-inner vertical-center">
		<Encrypter />
	</div>
</Card>

{#if innerWidth > 1000}
	<div class="banner-box">
		<Banner />
	</div>
{/if}

<svelte:window bind:innerWidth />

<style>
	.card-inner {
		min-height: 600px;
		padding-bottom: calc(var(--spacing) * 4);
	}

	:global(.encrypter-card) {
		min-height: 600px;
		width: var(--encrypter-card-width);
		position: absolute;
	}
	.banner-box {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		max-width: 1200px;
		flex: 1;
	}
</style>
