export const prerender = false;
export const ssr = false;

export function load({ params }: { params: { key: string } }) {
	return { key: params.key };
}
