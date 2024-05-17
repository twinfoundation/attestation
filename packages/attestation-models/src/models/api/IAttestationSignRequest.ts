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
		 * The namespace of the attestation service to use. The service has a built in default if none is supplied.
		 */
		attestationNamespace?: string;

		/**
		 * The key id from a vault to sign the data.
		 */
		keyId: string;

		/**
		 * The base64 encoded data to sign.
		 */
		data: string;
	};
}
