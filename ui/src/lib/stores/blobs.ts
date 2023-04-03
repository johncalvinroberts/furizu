import { get } from "svelte/store";
import type { BlobItem, BlobsState, BlobMap } from "../../types/types";
import { extractErrorMessageString } from "../utils";
import type { ListBlobsResponseDTO, UploadBlobRequestDTO } from "../../types/dtos";
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
		await this.getBlobs();
		this.dispatch({ isInitialized: true });
	}

	public async getBlobs() {
		try {
			this.dispatch({ isLoadingBlobs: true });
			const {
				balanceBytes,
				blobs: rawBlobs,
				count,
			} = await apiClient.get<ListBlobsResponseDTO>("api/blobs");
			const blobs = rawBlobs.reduce((memo: BlobMap, current: BlobItem) => {
				memo.set(current.key, current);
				return memo;
			}, new Map<string, BlobItem>());
			this.dispatch({ balanceBytes, count, blobs });
		} catch (error) {
			display.enqueueMessage(extractErrorMessageString(error), "error");
		} finally {
			this.dispatch({ isLoadingBlobs: false });
		}
	}

	public async createBlob(payload: UploadBlobRequestDTO): Promise<BlobItem> {
		try {
			this.dispatch({ isCreatingBlob: true });
			const res = await apiClient.post<BlobItem>("api/blobs", payload);
			const { blobs } = get(this.store);
			blobs.set(res.key, res);
			this.dispatch({ blobs });
			return res;
		} finally {
			this.dispatch({ isCreatingBlob: false });
		}
	}
}

export const blobsStore = new BlobsStore(initialState);
