// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAttestationInformation } from "../IAttestationInformation";

/**
 * The response to transferring the attestation.
 */
export interface IAttestationTransferResponse<T = unknown> {
	/**
	 * The data returned from the transfer response.
	 */
	body: {
		/**
		 * The updated attestation information.
		 */
		information: IAttestationInformation<T>;
	};
}
