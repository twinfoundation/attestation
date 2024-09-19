// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Configuration for the Entity Storage Attestation Connector.
 */
export interface IEntityStorageAttestationConnectorConfig {
	/**
	 * The tag to use for the attestation NFTs.
	 * @default TWIN-ATTESTATION
	 */
	tag?: string;
}
