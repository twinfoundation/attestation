// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Transfer the attestation to a new holder.
 */
export interface IAttestationTransferRequest {
	/**
	 * The parameters to be used in the transfer.
	 */
	pathParams: {
		/**
		 * The attestation id to transfer.
		 */
		id: string;
	};

	/**
	 * The parameters to be used in the transfer.
	 */
	body: {
		/**
		 * The new holder identity.
		 */
		holderIdentity: string;

		/**
		 * The new holder address.
		 */
		holderAddress: string;
	};
}
