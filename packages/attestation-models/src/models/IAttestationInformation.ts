// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IJsonLdContextDefinitionElement, IJsonLdNodeObject } from "@twin.org/data-json-ld";
import type { SchemaOrgContexts } from "@twin.org/standards-schema-org";
import type { AttestationContexts } from "./attestationContexts";
import type { AttestationTypes } from "./attestationTypes";

/**
 * Interface describing the collated attestation information.
 */
export interface IAttestationInformation {
	/**
	 * JSON-LD Context.
	 */
	"@context": [
		typeof AttestationContexts.ContextRoot,
		typeof AttestationContexts.ContextRootCommon,
		typeof SchemaOrgContexts.ContextRoot,
		...IJsonLdContextDefinitionElement[]
	];

	/**
	 * JSON-LD Type.
	 */
	type: typeof AttestationTypes.Information;

	/**
	 * The unique identifier of the attestation.
	 */
	id: string;

	/**
	 * Created date/time of the attestation in ISO format.
	 */
	dateCreated: string;

	/**
	 * Transferred date/time of the attestation in ISO format, can be blank if holder identity is owner.
	 */
	dateTransferred?: string;

	/**
	 * The identity of the owner.
	 */
	ownerIdentity: string;

	/**
	 * The identity of the current holder, can be undefined if owner is still the holder.
	 */
	holderIdentity?: string;

	/**
	 * The data that was attested.
	 */
	attestationObject: IJsonLdNodeObject;

	/**
	 * The proof for the attested data.
	 */
	proof?: IJsonLdNodeObject;

	/**
	 * Whether the attestation has been verified.
	 */
	verified?: boolean;

	/**
	 * The verification failure message.
	 */
	verificationFailure?: string;
}
