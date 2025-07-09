// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * Configuration for the NFT Attestation Connector.
 */
export interface INftAttestationConnectorConfig {
	/**
	 * The tag to use for the attestation NFTs.
	 * @default TWIN-ATTESTATION
	 */
	tag?: string;
}
