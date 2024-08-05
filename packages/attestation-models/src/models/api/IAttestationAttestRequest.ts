// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Attest the data and return the collated attestation details.
 */
export interface IAttestationAttestRequest {
	/**
	 * The data to be used in the signing.
	 */
	body: {
		/**
		 * The controller address for the attestation.
		 */
		address: string;

		/**
		 * The identity verification method to use for attesting the data.
		 */
		verificationMethodId: string;

		/**
		 * The data object to attest.
		 */
		data: unknown;

		/**
		 * The namespace of the connector to use for the attestation, defaults to service configured namespace.
		 */
		namespace?: string;
	};
}
