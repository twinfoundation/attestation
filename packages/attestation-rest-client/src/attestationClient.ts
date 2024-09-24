// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { BaseRestClient } from "@twin.org/api-core";
import type { IBaseRestClientConfig, INoContentResponse } from "@twin.org/api-models";
import type {
	IAttestationAttestRequest,
	IAttestationAttestResponse,
	IAttestationComponent,
	IAttestationDestroyRequest,
	IAttestationInformation,
	IAttestationTransferRequest,
	IAttestationTransferResponse,
	IAttestationVerifyRequest,
	IAttestationVerifyResponse
} from "@twin.org/attestation-models";
import { Guards, Urn } from "@twin.org/core";
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";
import { nameof } from "@twin.org/nameof";

/**
 * Client for performing attestation through to REST endpoints.
 */
export class AttestationClient extends BaseRestClient implements IAttestationComponent {
	/**
	 * Runtime name for the class.
	 */
	public readonly CLASS_NAME: string = nameof<AttestationClient>();

	/**
	 * Create a new instance of AttestationClient.
	 * @param config The configuration for the client.
	 */
	constructor(config: IBaseRestClientConfig) {
		super(nameof<AttestationClient>(), config, "attestation");
	}

	/**
	 * Attest the data and return the collated information.
	 * @param verificationMethodId The identity verification method to use for attesting the data.
	 * @param data The data to attest.
	 * @param namespace The namespace of the connector to use for the attestation, defaults to component configured namespace.
	 * @returns The collated attestation data.
	 */
	public async attest(
		verificationMethodId: string,
		data: IJsonLdNodeObject,
		namespace?: string
	): Promise<IAttestationInformation> {
		Guards.stringValue(this.CLASS_NAME, nameof(verificationMethodId), verificationMethodId);
		Guards.object<IJsonLdNodeObject>(this.CLASS_NAME, nameof(data), data);

		const response = await this.fetch<IAttestationAttestRequest, IAttestationAttestResponse>(
			"/",
			"POST",
			{
				body: {
					verificationMethodId,
					data,
					namespace
				}
			}
		);

		return response.body.information;
	}

	/**
	 * Resolve and verify the attestation id.
	 * @param attestationId The attestation id to verify.
	 * @returns The verified attestation details.
	 */
	public async verify(attestationId: string): Promise<{
		verified: boolean;
		failure?: string;
		information?: Partial<IAttestationInformation>;
	}> {
		Urn.guard(this.CLASS_NAME, nameof(attestationId), attestationId);

		const response = await this.fetch<IAttestationVerifyRequest, IAttestationVerifyResponse>(
			"/:id",
			"GET",
			{
				pathParams: {
					id: attestationId
				}
			}
		);

		return {
			verified: response.body.verified,
			failure: response.body.failure,
			information: response.body.information
		};
	}

	/**
	 * Transfer the attestation to a new holder.
	 * @param attestationId The attestation to transfer.
	 * @param holderIdentity The identity to transfer the attestation to.
	 * @returns The updated attestation details.
	 */
	public async transfer(
		attestationId: string,
		holderIdentity: string
	): Promise<IAttestationInformation> {
		Urn.guard(this.CLASS_NAME, nameof(attestationId), attestationId);
		Guards.stringValue(this.CLASS_NAME, nameof(holderIdentity), holderIdentity);

		const response = await this.fetch<IAttestationTransferRequest, IAttestationTransferResponse>(
			"/:id/transfer",
			"PUT",
			{
				pathParams: {
					id: attestationId
				},
				body: {
					holderIdentity
				}
			}
		);

		return response.body.information;
	}

	/**
	 * Destroy the attestation.
	 * @param attestationId The attestation to transfer.
	 * @returns The updated attestation details.
	 */
	public async destroy(attestationId: string): Promise<void> {
		Urn.guard(this.CLASS_NAME, nameof(attestationId), attestationId);

		await this.fetch<IAttestationDestroyRequest, INoContentResponse>("/:id", "DELETE", {
			pathParams: {
				id: attestationId
			}
		});
	}
}
