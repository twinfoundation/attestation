// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAttestationInformation } from "../IAttestationInformation";

/**
 * The response to verifying the attestation.
 */
export interface IAttestationVerifyResponse {
	/**
	 * The data returned from the verification response.
	 */
	body: {
		/**
		 * Whether the attestation is verified.
		 */
		verified: boolean;

		/**
		 * The failure message if the attestation is not verified.
		 */
		failure?: string;

		/**
		 * The attestation information.
		 */
		information?: Partial<IAttestationInformation>;
	};
}
