// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IEntityStorageAttestationConnectorConfig } from "./IEntityStorageAttestationConnectorConfig";

/**
 * Options for the entity storage attestation connector constructor.
 */
export interface IEntityStorageAttestationConnectorConstructorOptions {
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
	config?: IEntityStorageAttestationConnectorConfig;
}
