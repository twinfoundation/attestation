// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Interface describing an attestation proof.
 */
export interface IAttestationProof {
	/**
	 * The type of the proof.
	 */
	type: string;

	/**
	 * The value of the proof.
	 */
	value: string;
}
