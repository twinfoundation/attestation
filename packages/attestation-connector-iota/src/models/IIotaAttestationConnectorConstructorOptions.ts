// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IIotaAttestationConnectorConfig } from "./IIotaAttestationConnectorConfig";

/**
 * Options for the IOTA attestation connector constructor.
 */
export interface IIotaAttestationConnectorConstructorOptions {
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
	config?: IIotaAttestationConnectorConfig;
}
