// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAttestationProof } from "../IAttestationProof";

/**
 * The response when creating the proof for a data set.
 */
export interface IAttestationSignResponse {
	/**
	 * The data to be used in the signing.
	 */
	body: {
		/**
		 * The proof for the data.
		 */
		proof: IAttestationProof;
	};
}
