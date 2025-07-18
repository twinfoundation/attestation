// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { DataTypeHandlerFactory, type IJsonSchema } from "@twin.org/data-core";
import { AttestationContexts } from "../models/attestationContexts";
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
		DataTypeHandlerFactory.register(
			`${AttestationContexts.ContextRoot}${AttestationTypes.Information}`,
			() => ({
				context: AttestationContexts.ContextRoot,
				type: AttestationTypes.Information,
				defaultValue: {},
				jsonSchema: async () => AttestationInformationSchema as IJsonSchema
			})
		);
		DataTypeHandlerFactory.register(
			`${AttestationContexts.ContextRoot}${AttestationTypes.JwtProof}`,
			() => ({
				context: AttestationContexts.ContextRoot,
				type: AttestationTypes.JwtProof,
				defaultValue: {},
				jsonSchema: async () => AttestationJwtProofSchema as IJsonSchema
			})
		);
	}
}
