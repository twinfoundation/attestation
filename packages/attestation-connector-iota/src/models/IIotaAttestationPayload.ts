// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Model for the attestation payload.
 */
export interface IIotaAttestationPayload {
	/**
	 * The version which identifies the content of the payload.
	 */
	version: string;

	/**
	 * The proof of the attestation.
	 */
	proof?: unknown;
}
