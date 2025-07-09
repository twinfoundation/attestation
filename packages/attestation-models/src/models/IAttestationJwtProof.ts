// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdContextDefinitionElement } from "@twin.org/data-json-ld";
import type { AttestationContexts } from "./attestationContexts";
import type { AttestationTypes } from "./attestationTypes";

/**
 * Interface describing an attestation proof.
 */
export interface IAttestationJwtProof {
	/**
	 * JSON-LD Context.
	 */
	"@context":
		| typeof AttestationContexts.ContextRoot
		| [typeof AttestationContexts.ContextRoot, ...IJsonLdContextDefinitionElement[]];

	/**
	 * The type of the proof.
	 */
	type: typeof AttestationTypes.JwtProof;

	/**
	 * The value of the proof.
	 */
	value: string;
}
