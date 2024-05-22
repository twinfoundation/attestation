// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The response to verifying a proof.
 */
export interface IAttestationVerifyResponse {
	/**
	 * The data to be used in the verification response.
	 */
	body: {
		verified: boolean;
	};
}
