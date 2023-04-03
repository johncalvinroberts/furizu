<script lang="ts">
	/* eslint-disable import/no-unresolved */
	import { apiClient } from "../stores/api";
	import { goto } from "$app/navigation";
	/* eslint-enable import/no-unresolved */

	const { store } = apiClient;
	$: {
		if (!$store.isAuthenticated) {
			goto("/");
		}
	}
</script>

<slot />
