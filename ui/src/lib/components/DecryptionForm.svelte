<script lang="ts">
	import { encrypter } from "../stores/encrypter";
	import Eye from "./icons/Eye.svelte";

	const { store, handleDecrypt, reset } = encrypter;
	let showPassword = false;
	let password = "";
	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		handleDecrypt(password);
	};
</script>

<div class="box">
	<div class="title">
		<h6>Decrypt File</h6>
		{#if $store.hint}
			<small>
				Hint: {$store.hint}
			</small>
		{:else}
			<small>
				Hint: <em>No hint was given</em>
			</small>
		{/if}
	</div>
	<form on:submit={handleSubmit} on:reset={reset} autocomplete="off">
		<div class="input-box">
			<input
				name="secret"
				placeholder="Password"
				type={showPassword ? "text" : "password"}
				value={password}
				autocomplete="off"
				spellcheck="false"
				on:input={(e) => (password = e.currentTarget.value)}
			/>
			<button
				type="button"
				class="vertical-center"
				on:click={() => (showPassword = !showPassword)}
				title={showPassword ? "Hide" : "Show"}
			>
				<Eye strikethrough={!showPassword} />
			</button>
		</div>
		<div class="bottom-box">
			<button type="reset"> Cancel </button>
			<button type="submit" disabled={!password}> Decrypt </button>
		</div>
	</form>
</div>

<style>
	.box {
		display: flex;
		justify-content: flex-start;
		flex-wrap: wrap;
	}
	.title {
		width: 100%;
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		margin-bottom: 1rem;
	}
	h6 {
		text-align: center;
		margin-bottom: 0;
		width: 100%;
	}
</style>
