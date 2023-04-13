<script lang="ts">
	import { display } from "../stores/display";
	import { apiClient } from "../stores/api";
	import Button from "./Button.svelte";
	import Form from "./form/Form.svelte";
	import Input from "./form/Input.svelte";
	import OverlayLoading from "./OverlayLoading.svelte";

	export let title = "Authenticate who you are";
	let step: "START_WHOAMI" | "TRY_WHOAMI" = "START_WHOAMI";
	let email: string;
	let tryWhoamiChallengeInput: HTMLInputElement;
	let otp: string;

	const { store: displayStore } = display;
	const { store: apiClientStore } = apiClient;

	const handleStartWhoami = async () => {
		await apiClient.startWhoamiChallenge(email);
		step = "TRY_WHOAMI";
		tryWhoamiChallengeInput?.focus();
	};

	const tryWhoamiChallenge = async () => {
		await apiClient.tryWhoamiChallenge(email, otp);
		if ($displayStore.isAuthModalOpen) {
			display.toggleAuthModal();
		}
	};
</script>

{#if $apiClientStore.isAuthLoading}
	<OverlayLoading height={"312px"} />
{/if}

<div class="box">
	<h3>{title}</h3>
	<Form on:submit={handleStartWhoami} disabled={step === "TRY_WHOAMI"}>
		<Input name="email" type="email" label="Email" bind:value={email} required />
		<Button type="submit">Send Code</Button>
	</Form>
	<Form on:submit={tryWhoamiChallenge} disabled={step !== "TRY_WHOAMI"} prevent:default>
		<Input
			name="otp"
			type="text"
			label="Code"
			disabled={step !== "TRY_WHOAMI"}
			bind:value={otp}
			ref={tryWhoamiChallengeInput}
			required
		/>
		<Button type="submit" disabled={step !== "TRY_WHOAMI"}>Submit</Button>
	</Form>
</div>

<style>
	.box {
		margin-bottom: 100px;
	}
</style>
