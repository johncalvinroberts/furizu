<script lang="ts">
	export let title = "";
	import { fade } from "svelte/transition";
	let isHovered = false;
	let x: number;
	let y: number;
	let className = "";
	export { className as class };
	const id = `tooltip-${Math.random() * 1000}`;

	const handleMouseOver = (event: MouseEvent) => {
		isHovered = true;
		x = event.offsetX + 5;
		y = event.offsetY + 5;
	};

	const handleMouseMove = (event: MouseEvent) => {
		x = event.offsetX + 5;
		y = event.offsetY + 5;
	};

	const handleFocus = () => {
		// TODO
	};

	const handleMouseLeave = () => {
		isHovered = false;
	};
</script>

<div
	on:mouseover={handleMouseOver}
	on:mouseleave={handleMouseLeave}
	on:mousemove={handleMouseMove}
	on:focus={handleFocus}
	class={`box ${className}`}
	aria-describedby={id}
	role="tooltip"
>
	<slot />
	{#if isHovered}
		<div
			style="top: {y}px; left: {x}px;"
			class="tooltip"
			aria-expanded={isHovered}
			transition:fade={{ duration: 100 }}
			{id}
		>
			{@html title}
		</div>
	{/if}
</div>

<style>
	.box {
		position: relative;
		cursor: help;
	}

	.tooltip {
		background-color: var(--light);
		color: var(--dark);
		box-shadow: var(--boxy-shadow);
		border: solid 1px var(--dark);
		padding: var(--spacing);
		line-height: var(--default-line-height);
		width: 140px;
		z-index: var(--z-index-popover);
		position: absolute;
		transition: all 0.1s ease;
	}
</style>
