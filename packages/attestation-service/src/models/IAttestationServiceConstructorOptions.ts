// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAttestationServiceConfig } from "./IAttestationServiceConfig";

/**
 * Options for the attestation service constructor.
 */
export interface IAttestationServiceConstructorOptions {
	/**
	 * The configuration for the service.
	 */
	config?: IAttestationServiceConfig;
}
