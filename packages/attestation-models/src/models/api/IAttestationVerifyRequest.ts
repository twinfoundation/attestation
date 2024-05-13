// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IDidProof } from "@gtsc/standards-w3c-did";

/**
 * Verify that the proof is valid for the data set.
 */
export interface IAttestationVerifyRequest {
	/**
	 * The parameters to be used in the verification.
	 */
	body: {
		/**
		 * The data set that was signed.
		 */
		data: unknown;

		/**
		 * The proof for the data set.
		 */
		proof: IDidProof;
	};
}
