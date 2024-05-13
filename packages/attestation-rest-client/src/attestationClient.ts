// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { BaseRestClient, type IBaseRestClientConfig } from "@gtsc/api-models";
import type {
	IAttestation,
	IAttestationSignRequest,
	IAttestationSignResponse,
	IAttestationVerifyRequest,
	IAttestationVerifyResponse
} from "@gtsc/attestation-models";
import { Guards, StringHelper } from "@gtsc/core";
import { nameof } from "@gtsc/nameof";
import type { IRequestContext } from "@gtsc/services";
import type { IDidProof } from "@gtsc/standards-w3c-did";

/**
 * Client for performing attestation through to REST endpoints.
 */
export class AttestationClient extends BaseRestClient implements IAttestation {
	/**
	 * Runtime name for the class.
	 * @internal
	 */
	private static readonly _CLASS_NAME: string = nameof<AttestationClient>();

	/**
	 * Create a new instance of AttestationClient.
	 * @param config The configuration for the client.
	 */
	constructor(config: IBaseRestClientConfig) {
		super(AttestationClient._CLASS_NAME, config, StringHelper.kebabCase(nameof<IAttestation>()));
	}

	/**
	 * Sign the data and return the proof.
	 * @param requestContext The context for the request.
	 * @param data The data to sign.
	 * @returns The proof for the data with the id set as a unique identifier for the data.
	 */
	public async sign(requestContext: IRequestContext, data: unknown): Promise<IDidProof> {
		Guards.object(AttestationClient._CLASS_NAME, nameof(requestContext), requestContext);
		Guards.stringValue(
			AttestationClient._CLASS_NAME,
			nameof(requestContext.tenantId),
			requestContext.tenantId
		);
		Guards.object(AttestationClient._CLASS_NAME, nameof(data), data);
		const response = await this.fetch<IAttestationSignRequest, IAttestationSignResponse>(
			requestContext,
			"/sign",
			"POST",
			{
				body: {
					data
				}
			}
		);

		return response.body.proof;
	}

	/**
	 * Verify the data against the proof the proof.
	 * @param requestContext The context for the request.
	 * @param data The data to verify.
	 * @param proof The proof to verify against.
	 * @returns True if the verification is successful.
	 */
	public async verify(
		requestContext: IRequestContext,
		data: unknown,
		proof: IDidProof
	): Promise<boolean> {
		Guards.object(AttestationClient._CLASS_NAME, nameof(requestContext), requestContext);
		Guards.stringValue(
			AttestationClient._CLASS_NAME,
			nameof(requestContext.tenantId),
			requestContext.tenantId
		);
		Guards.object(AttestationClient._CLASS_NAME, nameof(data), data);
		Guards.object(AttestationClient._CLASS_NAME, nameof(proof), proof);
		const response = await this.fetch<IAttestationVerifyRequest, IAttestationVerifyResponse>(
			requestContext,
			"/verify",
			"POST",
			{
				body: {
					data,
					proof
				}
			}
		);

		return response.body.verified;
	}
}
