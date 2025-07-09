// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Destroy the attestation.
 */
export interface IAttestationDestroyRequest {
	/**
	 * The parameters to be used in the destruction.
	 */
	pathParams: {
		/**
		 * The attestation id to destroy.
		 */
		id: string;
	};
}
