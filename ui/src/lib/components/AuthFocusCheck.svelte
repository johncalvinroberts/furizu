<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import { apiClient } from "../stores/api";
	import { browser } from "$app/environment";

	const handleFocus = () => {
		apiClient.checkJWTAndEndSessionIfInvalid();
	};

	onMount(() => {
		if (browser) {
			window.addEventListener("focus", handleFocus);
		}
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener("focus", handleFocus);
		}
	});
</script>
