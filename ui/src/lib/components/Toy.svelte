<script>
	import { Toy } from "@leveluptuts/svelte-toy";
	import { encrypter } from "../stores/encrypter";
	import { display } from "../stores/display";
	import { apiClient } from "../stores/api";
	import { IS_PROD } from "../constants";
</script>

{#if !IS_PROD}
	<Toy
		register={{
			encrypter: encrypter.store,
			display: display.store,
			api: apiClient.store,
		}}
	/>
{/if}
