import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";

/** @type {import('vite').UserConfig} */
export default defineConfig(() => {
	return {
		plugins: [sveltekit()],
		server: {
			port: 1234,
			fs: {
				allow: [".."],
			},
		},
	};
});
