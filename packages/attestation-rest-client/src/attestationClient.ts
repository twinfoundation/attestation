// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { BaseRestClient, type IBaseRestClientConfig } from "@gtsc/api-models";
import type {
	IAttestation,
	IAttestationProof,
	IAttestationSignRequest,
	IAttestationSignResponse,
	IAttestationVerifyRequest,
	IAttestationVerifyResponse
} from "@gtsc/attestation-models";
import { Guards, StringHelper, Urn } from "@gtsc/core";
import { nameof } from "@gtsc/nameof";
import type { IRequestContext } from "@gtsc/services";

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
	 * @param keyId The key id from a vault to sign the data.
	 * @param data The data to store in blob storage and sign as base64.
	 * @param attestationNamespace The namespace of the attestation service to use. The service has a built in default if none is supplied.
	 * @returns The proof for the data with the id set as a unique identifier for the data.
	 */
	public async sign(
		requestContext: IRequestContext,
		keyId: string,
		data: string,
		attestationNamespace?: string
	): Promise<IAttestationProof> {
		Guards.object(AttestationClient._CLASS_NAME, nameof(requestContext), requestContext);
		Guards.stringValue(
			AttestationClient._CLASS_NAME,
			nameof(requestContext.tenantId),
			requestContext.tenantId
		);
		Guards.stringValue(AttestationClient._CLASS_NAME, nameof(keyId), keyId);
		Guards.stringBase64(AttestationClient._CLASS_NAME, nameof(data), data);
		const response = await this.fetch<IAttestationSignRequest, IAttestationSignResponse>(
			requestContext,
			"/sign",
			"POST",
			{
				body: {
					attestationNamespace,
					keyId,
					data
				}
			}
		);

		return response.body.proof;
	}

	/**
	 * Verify the data against the proof.
	 * @param requestContext The context for the request.
	 * @param proof The proof to verify against.
	 * @returns True if the verification is successful.
	 */
	public async verify(requestContext: IRequestContext, proof: IAttestationProof): Promise<boolean> {
		Guards.object(AttestationClient._CLASS_NAME, nameof(requestContext), requestContext);
		Guards.stringValue(
			AttestationClient._CLASS_NAME,
			nameof(requestContext.tenantId),
			requestContext.tenantId
		);
		Guards.object(AttestationClient._CLASS_NAME, nameof(proof), proof);
		Urn.guard(AttestationClient._CLASS_NAME, nameof(proof.id), proof.id);

		const response = await this.fetch<IAttestationVerifyRequest, IAttestationVerifyResponse>(
			requestContext,
			"/verify",
			"POST",
			{
				body: {
					proof
				}
			}
		);

		return response.body.verified;
	}
}
