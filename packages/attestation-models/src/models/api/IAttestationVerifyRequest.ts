// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAttestationProof } from "../IAttestationProof";

/**
 * Verify that the proof is valid for the data.
 */
export interface IAttestationVerifyRequest {
	/**
	 * The parameters to be used in the verification.
	 */
	body: {
		/**
		 * The proof to verify.
		 */
		proof: IAttestationProof;
	};
}
