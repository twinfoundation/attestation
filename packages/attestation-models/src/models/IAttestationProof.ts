// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IDidProof } from "@gtsc/standards-w3c-did";

/**
 * Interface describing an attestation proof.
 */
export interface IAttestationProof extends IDidProof {
	/**
	 * The location of the data in blob storage.
	 */
	blobStorageId: string;
}
