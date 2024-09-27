// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IComponent } from "@twin.org/core";
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";
import type { IAttestationInformation } from "./IAttestationInformation";

/**
 * Interface describing an attestation connector.
 */
export interface IAttestationConnector extends IComponent {
	/**
	 * Attest the data and return the collated information.
	 * @param controller The controller identity of the user to access the vault keys.
	 * @param address The controller address for the attestation.
	 * @param verificationMethodId The identity verification method to use for attesting the data.
	 * @param attestationObject The data to attest.
	 * @returns The collated attestation data.
	 */
	create(
		controller: string,
		address: string,
		verificationMethodId: string,
		attestationObject: IJsonLdNodeObject
	): Promise<string>;

	/**
	 * Resolve and verify the attestation id.
	 * @param id The attestation id to verify.
	 * @returns The verified attestation details.
	 */
	get(id: string): Promise<IAttestationInformation>;

	/**
	 * Transfer the attestation to a new holder.
	 * @param controller The controller identity of the user to access the vault keys.
	 * @param attestationId The attestation to transfer.
	 * @param holderIdentity The holder identity of the attestation.
	 * @param holderAddress The new controller address of the attestation belonging to the holder.
	 * @returns Nothing.
	 */
	transfer(
		controller: string,
		attestationId: string,
		holderIdentity: string,
		holderAddress: string
	): Promise<void>;

	/**
	 * Destroy the attestation.
	 * @param controller The controller identity of the user to access the vault keys.
	 * @param attestationId The attestation to destroy.
	 * @returns Nothing.
	 */
	destroy(controller: string, attestationId: string): Promise<void>;
}
