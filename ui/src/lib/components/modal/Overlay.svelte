<script lang="ts">
	import TrapScreenReader from "./TrapScreenReader.svelte";
	import TrapFocus from "./TrapFocus.svelte";
	import LockScroll from "./LockScroll.svelte";
	import Portal from "./Portal.svelte";
	// Props
	export let onDismiss: () => void;
	export let initialFocusElement: HTMLElement;
	export let returnFocusElement: HTMLElement;
	export let ariaModalLegacy = false;
	const handleClick = () => {
		onDismiss();
	};
	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === "Escape") {
			onDismiss();
		}
	};
</script>

<svelte:window on:keydown={handleKeydown} />

<Portal>
	<TrapScreenReader enabled={ariaModalLegacy}>
		<TrapFocus {initialFocusElement} {returnFocusElement}>
			<LockScroll>
				<div
					{...$$restProps}
					role="none"
					data-svelte-dialog-overlay
					class="vertical-center"
					on:click|self|stopPropagation={handleClick}
				>
					<slot />
				</div>
			</LockScroll>
		</TrapFocus>
	</TrapScreenReader>
</Portal>

<style>
	div {
		background-color: var(--opaque);
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		overflow: auto;
		width: 100%;
		height: 100vh;
	}
</style>
