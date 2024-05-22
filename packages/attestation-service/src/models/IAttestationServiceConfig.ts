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
}
