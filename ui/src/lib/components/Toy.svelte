<script>
	import { Toy } from "@leveluptuts/svelte-toy";
	import { encrypter } from "../stores/encrypter";
	import { display } from "../stores/display";
	import { apiClient } from "../stores/api";
</script>

<Toy
	register={{
		encrypter: encrypter.store,
		display: display.store,
		api: apiClient.store,
	}}
/>
