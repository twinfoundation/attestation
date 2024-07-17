// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IServiceRequestContext, IService } from "@gtsc/services";
import type { IAttestationInformation } from "./IAttestationInformation";

/**
 * Interface describing an attestation contract.
 */
export interface IAttestation extends IService {
	/**
	 * Attest the data and return the collated information.
	 * @param controllerAddress The controller address for the attestation.
	 * @param verificationMethodId The identity verification method to use for attesting the data.
	 * @param data The data to attest.
	 * @param options Additional options for the attestation service.
	 * @param options.namespace The namespace of the connector to use for the attestation, defaults to service configured namespace.
	 * @param requestContext The context for the request.
	 * @returns The collated attestation data.
	 */
	attest<T = unknown>(
		controllerAddress: string,
		verificationMethodId: string,
		data: T,
		options?: {
			namespace?: string;
		},
		requestContext?: IServiceRequestContext
	): Promise<IAttestationInformation<T>>;

	/**
	 * Resolve and verify the attestation id.
	 * @param attestationId The attestation id to verify.
	 * @param requestContext The context for the request.
	 * @returns The verified attestation details.
	 */
	verify<T = unknown>(
		attestationId: string,
		requestContext?: IServiceRequestContext
	): Promise<{
		verified: boolean;
		failure?: string;
		information?: Partial<IAttestationInformation<T>>;
	}>;

	/**
	 * Transfer the attestation to a new holder.
	 * @param attestationId The attestation to transfer.
	 * @param holderControllerAddress The new controller address of the attestation belonging to the holder.
	 * @param holderIdentity The holder identity of the attestation.
	 * @param requestContext The context for the request.
	 * @returns The updated attestation details.
	 */
	transfer<T = unknown>(
		attestationId: string,
		holderControllerAddress: string,
		holderIdentity: string,
		requestContext?: IServiceRequestContext
	): Promise<IAttestationInformation<T>>;
}
