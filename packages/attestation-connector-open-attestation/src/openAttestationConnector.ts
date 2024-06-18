// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAttestationConnector, IAttestationInformation } from "@gtsc/attestation-models";
import { NotImplementedError } from "@gtsc/core";
import { nameof } from "@gtsc/nameof";
import type { IRequestContext } from "@gtsc/services";
import type { IOpenAttestationConnectorConfig } from "./models/IOpenAttestationConnectorConfig";

/**
 * Class for performing attestation operations in entity storage.
 */
export class OpenAttestationConnector implements IAttestationConnector {
	/**
	 * The namespace for the entities.
	 */
	public static readonly NAMESPACE: string = "open-attestation";

	/**
	 * Runtime name for the class.
	 * @internal
	 */
	private static readonly _CLASS_NAME: string = nameof<OpenAttestationConnector>();

	/**
	 * Create a new instance of OpenAttestationConnector.
	 * @param config The configuration for the attestation connector.
	 */
	// eslint-disable-next-line @typescript-eslint/no-useless-constructor
	constructor(config?: IOpenAttestationConnectorConfig) {}

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
	public async attest<T = unknown>(
		requestContext: IRequestContext,
		controllerAddress: string,
		verificationMethodId: string,
		dataId: string,
		type: string,
		data: T
	): Promise<IAttestationInformation<T>> {
		throw new NotImplementedError(OpenAttestationConnector._CLASS_NAME, "attest");
	}

	/**
	 * Resolve and verify the attestation id.
	 * @param requestContext The context for the request.
	 * @param attestationId The attestation id to verify.
	 * @returns The verified attestation details.
	 */
	public async verify<T = unknown>(
		requestContext: IRequestContext,
		attestationId: string
	): Promise<{
		verified: boolean;
		failure?: string;
		information?: Partial<IAttestationInformation<T>>;
	}> {
		throw new NotImplementedError(OpenAttestationConnector._CLASS_NAME, "verify");
	}

	/**
	 * Transfer the attestation to a new holder.
	 * @param requestContext The context for the request.
	 * @param attestationId The attestation to transfer.
	 * @param holderControllerAddress The new controller address of the attestation belonging to the holder.
	 * @param holderIdentity The holder identity of the attestation.
	 * @returns The updated attestation details.
	 */
	public async transfer<T = unknown>(
		requestContext: IRequestContext,
		attestationId: string,
		holderControllerAddress: string,
		holderIdentity: string
	): Promise<IAttestationInformation<T>> {
		throw new NotImplementedError(OpenAttestationConnector._CLASS_NAME, "transfer");
	}
}
