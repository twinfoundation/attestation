// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Sign the data set and return the proof.
 */
export interface IAttestationSignRequest {
	/**
	 * The data to be used in the signing.
	 */
	body: {
		/**
		 * The data set that was signed.
		 */
		data: unknown;
	};
}
