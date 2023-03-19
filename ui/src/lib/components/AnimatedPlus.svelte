<script>
	export let isDraggingOver = false;
</script>

<svg
	width="80"
	height="80"
	fill="none"
	viewBox="0 0 24 24"
	class="icon"
	class:is-dragging-over={isDraggingOver}
>
	<rect width="2" height={22} rx="1" transform="matrix(-1 0 0 1 12 0)" fill="currentColor" />
	<path
		d="M21 12C21.5523 12 22 11.5523 22 11V11C22 10.4477 21.5523 10 21 10H12V12H21Z"
		fill="currentColor"
		class="right"
	/>
	<path
		d="M10 12V10H1C0.447716 10 5.96046e-07 10.4477 5.96046e-07 11V11C5.96046e-07 11.5523 0.447716 12 1 12H10Z"
		fill="currentColor"
		class="left"
	/>
</svg>

<style>
	.icon {
		cursor: pointer;
	}
	path {
		transition: all 0.3s cubic-bezier(0.075, 0.82, 0.165, 1);
		transform-origin: center;
	}
	.left {
		transform: translate(1px, 13px) rotate(29deg);
	}
	.right {
		transform: translate(-1px, 12px) rotate(-29deg);
	}
	.is-dragging-over {
		overflow: hidden;
	}
	.is-dragging-over .left,
	.is-dragging-over .right {
		transform: translate(0px, 0) rotate(0);
	}
</style>
