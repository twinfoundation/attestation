// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The contexts of attestation data.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const AttestationContexts = {
	/**
	 * The context root for the attestation types.
	 */
	ContextRoot: "https://schema.twindev.org/attestation/",

	/**
	 * The context root for the common types.
	 */
	ContextRootCommon: "https://schema.twindev.org/common/"
} as const;

/**
 * The contexts of attestation data.
 */
export type AttestationContexts = (typeof AttestationContexts)[keyof typeof AttestationContexts];
