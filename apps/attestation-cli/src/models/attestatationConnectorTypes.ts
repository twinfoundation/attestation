// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The attestation connector types.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const AttestationConnectorTypes = {
	/**
	 * IOTA.
	 */
	Iota: "iota",

	/**
	 * IOTA Stardust.
	 */
	IotaStardust: "iota-stardust"
} as const;

/**
 * The attestation connector types.
 */
export type AttestationConnectorTypes =
	(typeof AttestationConnectorTypes)[keyof typeof AttestationConnectorTypes];
