// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IComponent } from "@gtsc/core";
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
	 * @param data The data to attest.
	 * @returns The collated attestation data.
	 */
	attest<T = unknown>(
		controller: string,
		address: string,
		verificationMethodId: string,
		data: T
	): Promise<IAttestationInformation<T>>;

	/**
	 * Resolve and verify the attestation id.
	 * @param attestationId The attestation id to verify.
	 * @returns The verified attestation details.
	 */
	verify<T = unknown>(
		attestationId: string
	): Promise<{
		verified: boolean;
		failure?: string;
		information?: Partial<IAttestationInformation<T>>;
	}>;

	/**
	 * Transfer the attestation to a new holder.
	 * @param controller The controller identity of the user to access the vault keys.
	 * @param attestationId The attestation to transfer.
	 * @param holderAddress The new controller address of the attestation belonging to the holder.
	 * @param holderIdentity The holder identity of the attestation.
	 * @returns The updated attestation details.
	 */
	transfer<T = unknown>(
		controller: string,
		attestationId: string,
		holderIdentity: string,
		holderAddress: string
	): Promise<IAttestationInformation<T>>;

	/**
	 * Destroy the attestation.
	 * @param controller The controller identity of the user to access the vault keys.
	 * @param attestationId The attestation to destroy.
	 * @returns Nothing.
	 */
	destroy(controller: string, attestationId: string): Promise<void>;
}
