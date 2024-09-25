// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IComponent } from "@twin.org/core";
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";
import type { IAttestationInformation } from "./IAttestationInformation";

/**
 * Interface describing an attestation contract.
 */
export interface IAttestationComponent extends IComponent {
	/**
	 * Attest the data and return the collated information.
	 * @param verificationMethodId The identity verification method to use for attesting the data.
	 * @param data The data to attest.
	 * @param namespace The namespace of the connector to use for the attestation, defaults to component configured namespace.
	 * @param identity The identity to perform the attestation operation with.
	 * @param nodeIdentity The node identity to include in the attestation.
	 * @returns The collated attestation data.
	 */
	attest<T extends IJsonLdNodeObject>(
		verificationMethodId: string,
		data: T,
		namespace?: string,
		identity?: string,
		nodeIdentity?: string
	): Promise<IAttestationInformation<T>>;

	/**
	 * Resolve and verify the attestation id.
	 * @param attestationId The attestation id to verify.
	 * @returns The verified attestation details.
	 */
	verify<T extends IJsonLdNodeObject>(
		attestationId: string
	): Promise<{
		verified: boolean;
		failure?: string;
		information?: Partial<IAttestationInformation<T>>;
	}>;

	/**
	 * Transfer the attestation to a new holder.
	 * @param attestationId The attestation to transfer.
	 * @param holderIdentity The identity to transfer the attestation to.
	 * @param identity The identity to perform the attestation operation with.
	 * @returns The updated attestation details.
	 */
	transfer<T extends IJsonLdNodeObject>(
		attestationId: string,
		holderIdentity: string,
		identity?: string
	): Promise<IAttestationInformation<T>>;

	/**
	 * Destroy the attestation.
	 * @param attestationId The attestation to transfer.
	 * @param identity The identity to perform the attestation operation with.
	 * @returns The updated attestation details.
	 */
	destroy(attestationId: string, identity?: string): Promise<void>;
}
