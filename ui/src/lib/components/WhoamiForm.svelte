<script lang="ts">
	import { display } from "../stores/display";
	import { apiClient } from "../stores/api";
	import Button from "./Button.svelte";
	import Form from "./form/Form.svelte";
	import Input from "./form/Input.svelte";

	export let title = "Authenticate who you are";
	let step: "START_WHOAMI" | "TRY_WHOAMI" = "START_WHOAMI";
	let email: string;
	let otp: string;

	const { store: displayStore } = display;

	const handleStartWhoami = async () => {
		await apiClient.startWhoamiChallenge(email);
		step = "TRY_WHOAMI";
	};

	const tryWhoamiChallenge = async () => {
		await apiClient.tryWhoamiChallenge(email, otp);
		if ($displayStore.isAuthModalOpen) {
			display.toggleAuthModal();
		}
	};
</script>

<div class="box">
	<h3>{title}</h3>
	<Form on:submit={handleStartWhoami}>
		<Input name="email" type="email" label="Email" bind:value={email} />
		<Button type="submit">{step === "TRY_WHOAMI" ? "Resend Code" : "Send Code"}</Button>
	</Form>
	{#if step === "TRY_WHOAMI"}
		<small>Code sent to email</small>
	{/if}
	<Form on:submit={tryWhoamiChallenge} disabled={step !== "TRY_WHOAMI"} prevent:default>
		<Input name="otp" type="text" label="Code" disabled={step !== "TRY_WHOAMI"} bind:value={otp} />
		<Button type="submit" disabled={step !== "TRY_WHOAMI"}>Submit</Button>
	</Form>
</div>

<style>
	.box {
		margin-bottom: 100px;
	}
</style>
