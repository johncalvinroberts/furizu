<script lang="ts">
	import type { SvelteComponent } from "svelte";
	import Button from "./Button.svelte";

	type DropdownItem = {
		Icon: typeof SvelteComponent;
		label: string;
		href?: string;
		onClick?: () => void;
	};
	let isOpen = false;
	export let label = "";
	export let options: DropdownItem[] = [];

	const toggle = () => (isOpen = !isOpen);
	const handleMouseLeave = () => {
		if (isOpen) toggle();
	};
</script>

<Button
	variant="dropdown"
	on:click={toggle}
	on:mouseleave={handleMouseLeave}
	ariaExpanded={isOpen}
	aria-expanded={isOpen}
	aria-haspopup="listbox"
>
	{label}

	<ul role="menu" class:open={isOpen}>
		{#each options as option}
			<li role="menuitem" tabIndex="0" on:click={option.onClick} on:keypress={option.onClick}>
				{#if option.href}
					<a href={option.href}>
						<span class="menu-icon">
							<svelte:component this={option.Icon} />
						</span>
						<span>
							{option.label}
						</span>
					</a>
				{:else}
					<span class="menu-icon">
						<svelte:component this={option.Icon} />
					</span>
					<span>
						{option.label}
					</span>
				{/if}
			</li>
		{/each}
	</ul>
</Button>

<style>
	ul {
		z-index: var(--z-index-popover);
		list-style: none;
		padding: 0;
		margin: 0;
		padding: 0;
		position: absolute;
		background: var(--light);
		top: calc(var(--nav-height) - 1px);
		left: 0px;
		box-shadow: var(--boxy-shadow);
		border: solid 1px var(--dark);
		display: none;
	}
	ul.open {
		display: block;
	}
	li {
		text-align: left;
		color: var(--dark);
		padding: 2px 0;
		display: flex;
	}
	li:hover {
		background-color: var(--dark);
		color: var(--light);
	}
	.menu-icon {
		margin: 0 var(--spacing);
	}
	a {
		display: flex;
	}
	a:hover {
		color: var(--light);
		text-decoration: none;
	}
</style>
