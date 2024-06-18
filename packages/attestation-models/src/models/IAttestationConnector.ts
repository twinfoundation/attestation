// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IRequestContext, IService } from "@gtsc/services";
import type { IAttestationInformation } from "./IAttestationInformation";

/**
 * Interface describing an attestation connector.
 */
export interface IAttestationConnector extends IService {
	/**
	 * Attest the data and return the collated information.
	 * @param requestContext The context for the request.
	 * @param controllerAddress The controller address for the attestation.
	 * @param verificationMethodId The identity verification method to use for attesting the data.
	 * @param dataId The id of the attestation data.
	 * @param type The type which the data adheres to.
	 * @param data The data to attest.
	 * @returns The collated attestation data.
	 */
	attest<T = unknown>(
		requestContext: IRequestContext,
		controllerAddress: string,
		verificationMethodId: string,
		dataId: string,
		type: string,
		data: T
	): Promise<IAttestationInformation<T>>;

	/**
	 * Resolve and verify the attestation id.
	 * @param requestContext The context for the request.
	 * @param attestationId The attestation id to verify.
	 * @returns The verified attestation details.
	 */
	verify<T = unknown>(
		requestContext: IRequestContext,
		attestationId: string
	): Promise<{
		verified: boolean;
		failure?: string;
		information?: Partial<IAttestationInformation<T>>;
	}>;

	/**
	 * Transfer the attestation to a new holder.
	 * @param requestContext The context for the request.
	 * @param attestationId The attestation to transfer.
	 * @param holderControllerAddress The new controller address of the attestation belonging to the holder.
	 * @param holderIdentity The holder identity of the attestation.
	 * @returns The updated attestation details.
	 */
	transfer<T = unknown>(
		requestContext: IRequestContext,
		attestationId: string,
		holderControllerAddress: string,
		holderIdentity: string
	): Promise<IAttestationInformation<T>>;
}
