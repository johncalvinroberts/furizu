<script lang="ts">
	import { encrypter } from "../stores/encrypter";
	import { apiClient } from "../stores/api";
	import { STATE } from "../constants";
	import WhoamiForm from "./WhoamiForm.svelte";

	const backText = "<- Back";
	const handleBack = () => encrypter.dispatch({ state: STATE.SHOULD_ENCRYPT });

	const { store: apiClientStore } = apiClient;

	$: {
		if ($apiClientStore.isAuthenticated) {
			encrypter.handleAuthSuccess();
		}
	}
</script>

<div class="box">
	<WhoamiForm />
	<button class="back" on:click={handleBack}>{backText}</button>
</div>

<style>
	.box {
		max-width: 300px;
		height: 100%;
		height: 200px;
		position: relative;
	}
	button.back {
		border: none;
		color: var(--dark);
		background-color: transparent;
		width: auto;
	}
</style>
