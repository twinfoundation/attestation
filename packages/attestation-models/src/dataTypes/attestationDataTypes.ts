// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { DataTypeHandlerFactory } from "@twin.org/data-core";
import type { JSONSchema7 } from "json-schema";
import { AttestationTypes } from "../models/attestationTypes";
import AttestationInformationSchema from "../schemas/AttestationInformation.json";
import AttestationJwtProofSchema from "../schemas/AttestationJwtProof.json";

/**
 * Handle all the data types for attestation.
 */
export class AttestationDataTypes {
	/**
	 * Register all the data types.
	 */
	public static registerTypes(): void {
		DataTypeHandlerFactory.register(AttestationTypes.Information, () => ({
			type: AttestationTypes.Information,
			defaultValue: {},
			jsonSchema: async () => AttestationInformationSchema as JSONSchema7
		}));
		DataTypeHandlerFactory.register(AttestationTypes.JwtProof, () => ({
			type: AttestationTypes.JwtProof,
			defaultValue: {},
			jsonSchema: async () => AttestationJwtProofSchema as JSONSchema7
		}));
	}
}
