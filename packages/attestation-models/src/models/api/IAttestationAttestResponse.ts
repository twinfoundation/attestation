// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAttestationInformation } from "../IAttestationInformation";

/**
 * The response when creating the attestation for some data.
 */
export interface IAttestationAttestResponse {
	/**
	 * The result of the attestation process.
	 */
	body: {
		/**
		 * The attestation information.
		 */
		information: IAttestationInformation;
	};
}
