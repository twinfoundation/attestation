// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IService } from "@gtsc/services";
import type { IAttestationInformation } from "./IAttestationInformation";

/**
 * Interface describing an attestation contract.
 */
export interface IAttestation extends IService {
	/**
	 * Attest the data and return the collated information.
	 * @param address The controller address for the attestation.
	 * @param verificationMethodId The identity verification method to use for attesting the data.
	 * @param data The data to attest.
	 * @param options Additional options for the attestation service.
	 * @param options.namespace The namespace of the connector to use for the attestation, defaults to service configured namespace.
	 * @param identity The identity to perform the attestation operation with.
	 * @returns The collated attestation data.
	 */
	attest<T = unknown>(
		address: string,
		verificationMethodId: string,
		data: T,
		options?: {
			namespace?: string;
		},
		identity?: string
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
	 * @param attestationId The attestation to transfer.
	 * @param holderIdentity The holder identity of the attestation.
	 * @param holderAddress The new controller address of the attestation belonging to the holder.
	 * @param identity The identity to perform the attestation operation with.
	 * @returns The updated attestation details.
	 */
	transfer<T = unknown>(
		attestationId: string,
		holderIdentity: string,
		holderAddress: string,
		identity?: string
	): Promise<IAttestationInformation<T>>;
}
