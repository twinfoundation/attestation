// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Configuration for the Attestation Service.
 */
export interface IAttestationServiceConfig {
	/**
	 * What is the default connector to use for attestation. If not provided the first connector from the factory will be used.
	 */
	defaultNamespace?: string;

	/**
	 * The wallet address index to use for funding and controlling the attestations.
	 * @default 0
	 */
	walletAddressIndex?: number;

	/**
	 * The node identity automatically gets added to the data payload being attested. This can be excluded if required.
	 * @default false
	 */
	excludeNodeIdentity?: boolean;

	/**
	 * The verification method id to use for the attestation.
	 * @default attestation-assertion
	 */
	verificationMethodId?: string;
}
