// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { INftAttestationConnectorConfig } from "./INftAttestationConnectorConfig";

/**
 * Options for the NFT attestation connector constructor.
 */
export interface INftAttestationConnectorConstructorOptions {
	/**
	 * The type of the identity connector.
	 * @default identity
	 */
	identityConnectorType?: string;

	/**
	 * The type of the nft connector.
	 * @default nft
	 */
	nftConnectorType?: string;

	/**
	 * The configuration for the connector.
	 */
	config?: INftAttestationConnectorConfig;
}
