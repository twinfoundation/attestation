// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";

/**
 * Attest the data and return the collated attestation details.
 */
export interface IAttestationAttestRequest {
	/**
	 * The data to be used in the signing.
	 */
	body: {
		/**
		 * The identity verification method to use for attesting the data.
		 */
		verificationMethodId: string;

		/**
		 * The data object to attest.
		 */
		data: IJsonLdNodeObject;

		/**
		 * The namespace of the connector to use for the attestation, defaults to component configured namespace.
		 */
		namespace?: string;
	};
}
