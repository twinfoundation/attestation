// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Verify that the proof is valid for the attestation.
 */
export interface IAttestationVerifyRequest {
	/**
	 * The parameters to be used in the verification.
	 */
	path: {
		/**
		 * The attestation id to verify.
		 */
		attestationId: string;
	};
}
