<script lang="ts">
	type Variant = "dropdown" | "default";
	export let variant: Variant = "default";
	const additionalClasses: Record<Variant, string> = {
		default: "",
		dropdown: "dropdown-button",
	};
</script>

<button
	class={`button ${additionalClasses[variant] || ""}`}
	{...$$restProps}
	on:click
	on:mouseleave
>
	<slot />
</button>

<style>
	.button {
		padding: 0 var(--spacing);
		height: var(--nav-height);
		min-width: 111px;
		background: var(--light);
		color: var(--dark);
		border: solid 1px var(--dark);
		border-radius: var(--spacing);
		transition: all 0.2s ease;
	}

	.button:hover {
		box-shadow: var(--boxy-shadow);
	}

	.button:active {
		background-color: var(--dark);
		color: var(--light);
		border-color: var(--light);
	}

	.button:focus {
		outline: 2px solid var(--dark);
		border: double 3px var(--dark);
	}

	.button:disabled {
		opacity: 0.5;
		pointer-events: none;
	}

	.dropdown-button {
		border: none;
		border-radius: 0;
		background-color: transparent;
		position: relative;
		padding: 0;
		height: unset;
	}
	.dropdown-button:hover {
		box-shadow: none;
	}
	.dropdown-button:focus,
	.dropdown-button:active {
		border: none;
		outline: none;
		background-color: var(--dark);
		color: var(--light);
	}
</style>
