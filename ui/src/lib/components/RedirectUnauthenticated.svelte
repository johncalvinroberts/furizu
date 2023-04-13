<script lang="ts">
	/* eslint-disable import/no-unresolved */
	import { apiClient } from "../stores/api";
	import { goto } from "$app/navigation";
	import { browser } from "$app/environment";
	/* eslint-enable import/no-unresolved */

	const { store } = apiClient;
	$: {
		if (!$store.isAuthenticated && browser) {
			goto("/");
		}
	}
</script>

<slot />
