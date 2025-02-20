// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The types of attestation data.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const AttestationTypes = {
	/**
	 * The context root for the attestation types.
	 */
	ContextRoot: "https://schema.twindev.org/attestation/",

	/**
	 * The context root for the common types.
	 */
	ContextRootCommon: "https://schema.twindev.org/common/",

	/**
	 * Represents attestation information.
	 */
	Information: "Information",

	/**
	 * Represents attestation JWT proof.
	 */
	JwtProof: "JwtProof"
} as const;

/**
 * The types of attestation data.
 */
export type AttestationTypes = (typeof AttestationTypes)[keyof typeof AttestationTypes];
