<script lang="ts">
	import { fly } from "svelte/transition";
	import type { DisplayMessage, DisplayMessageLevel } from "../../types/types";
	export let message: DisplayMessage;
	export let offset: number;

	const icons: Record<DisplayMessageLevel, string> = {
		error: "☒",
		info: "⚠︎",
		success: "❆",
	};
	const titles = {
		error: "Error",
		info: "Info",
		success: "Success",
	};
	const NAV_HEIGHT = 21;
</script>

<div
	class="box"
	style="top: {(offset + 1) * 10 + NAV_HEIGHT}px;"
	transition:fly={{ y: 200, duration: 400 }}
>
	<div class="vertical-center inner">
		<div class="title">
			<span class="icon {message.level}">
				{icons[message.level]}
			</span>
			<span class="title">{titles[message.level]}</span>
		</div>
		<span>
			{message.message}
		</span>
	</div>
</div>

<style>
	.box {
		background-color: var(--light);
		box-shadow: var(--boxy-shadow);
		border: solid 1px var(--dark);
		padding: var(--spacing);
		position: fixed;
		z-index: var(--z-index-popover);
		font-size: var(--font-size-small);
		width: var(--message-width);
		z-index: var(--z-index-msg-center);
		right: 10px;
	}
	.inner {
		justify-content: space-between;
	}

	.title {
		display: flex;
		align-items: center;
		font-weight: bold;
	}

	.icon {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		text-align: center;
		line-height: 18px;
		margin-right: var(--spacing);
	}

	.icon.error {
		background-color: var(--error);
		color: var(--dark);
	}

	.icon.info {
		background-color: var(--light);
		color: var(--dark);
	}
	.icon.success {
		background-color: var(--success);
		color: var(--dark);
	}
</style>
