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
		 * The key id from a vault to sign the data.
		 */
		keyId: string;

		/**
		 * The base64 encoded data to sign.
		 */
		data: string;

		/**
		 * The namespace to store the data in, defaults to service configured namespace.
		 */
		namespace?: string;
	};
}
