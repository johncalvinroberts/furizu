import { get } from "svelte/store";
import type { BlobItem, BlobsState, BlobMap } from "../../types/types";
import type { ListBlobsResponseDTO, UploadBlobRequestDTO, RawBlobItem } from "../../types/dtos";
import { delay, extractErrorMessageString } from "../utils";
import BaseStore from "./base";
import { apiClient } from "./api";
import { display } from "./display";

const initialState: BlobsState = {
	blobs: new Map(),
	count: 0,
	balanceBytes: 0,
	isLoadingBlobs: false,
	isInitialized: false,
	isCreatingBlob: false,
};

class BlobsStore extends BaseStore<BlobsState> {
	public async initialize() {
		const { isAuthenticated } = get(apiClient.store);
		if (isAuthenticated) await this.getBlobs();
		this.dispatch({ isInitialized: true });
	}

	public async getBlobs(): Promise<void> {
		try {
			const { isLoadingBlobs } = get(this.store);
			// dedupe requests, kind of in a hacky way
			if (isLoadingBlobs) {
				await delay(1000);
				const { isLoadingBlobs: isStillLoadingBlobs } = get(this.store);
				if (isStillLoadingBlobs) {
					return this.getBlobs();
				} else {
					return;
				}
			}
			this.dispatch({ isLoadingBlobs: true });
			// TODO: paginate
			const { blobs: rawBlobs = [], count } =
				await apiClient.get<ListBlobsResponseDTO>("api/blobs");
			const blobs = rawBlobs.reduce((memo: BlobMap, current) => {
				const massaged = this.massageBlob(current);
				memo.set(current.id, massaged);
				return memo;
			}, new Map<string, BlobItem>());
			this.dispatch({ count, blobs });
		} catch (error) {
			display.enqueueMessage(extractErrorMessageString(error), "error");
		} finally {
			this.dispatch({ isLoadingBlobs: false });
		}
	}

	public async createBlob(payload: UploadBlobRequestDTO): Promise<BlobItem> {
		try {
			this.dispatch({ isCreatingBlob: true });
			const res = await apiClient.post<RawBlobItem>("api/blobs", payload);
			const { blobs } = get(this.store);
			const massaged = this.massageBlob(res);
			blobs.set(res.id, massaged);
			this.dispatch({ blobs });
			return massaged;
		} finally {
			this.dispatch({ isCreatingBlob: false });
		}
	}

	public async getBlob(id: string): Promise<BlobItem> {
		const res = await apiClient.get<RawBlobItem>(`api/blobs/${id}`);
		const { blobs } = get(this.store);
		const massaged = this.massageBlob(res);
		blobs.set(res.id, massaged);
		this.dispatch({ blobs });
		return massaged;
	}

	public massageBlob(raw: RawBlobItem): BlobItem {
		return {
			...raw,
			publicURL: `${window.location.host}/files/${raw.id}`,
		};
	}
}

export const blobsStore = new BlobsStore(initialState);
