<script lang="ts">
	import Card from "../Card.svelte";
	import Overlay from "./Overlay.svelte";
	export let onDismiss: () => void;
	export let initialFocusElement: HTMLElement;
	export let returnFocusElement: HTMLElement;
</script>

<Overlay {returnFocusElement} {initialFocusElement} {onDismiss} ariaModalLegacy={false}>
	<Card class="modal-card">
		<slot />
	</Card>
</Overlay>

<style>
	:global(.modal-card) {
		min-width: var(--modal-min-width);
		position: relative;
	}
</style>
