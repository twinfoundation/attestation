// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { BaseRestClient } from "@gtsc/api-core";
import type { IBaseRestClientConfig, INoContentResponse } from "@gtsc/api-models";
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
} from "@gtsc/attestation-models";
import { Guards, Urn } from "@gtsc/core";
import { nameof } from "@gtsc/nameof";

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
	 * @param address The controller address for the attestation.
	 * @param verificationMethodId The identity verification method to use for attesting the data.
	 * @param data The data to attest.
	 * @param options Additional options for the attestation component.
	 * @param options.namespace The namespace of the connector to use for the attestation, defaults to component configured namespace.
	 * @returns The collated attestation data.
	 */
	public async attest<T = unknown>(
		address: string,
		verificationMethodId: string,
		data: T,
		options?: {
			namespace?: string;
		}
	): Promise<IAttestationInformation<T>> {
		Guards.stringValue(this.CLASS_NAME, nameof(address), address);
		Guards.stringValue(this.CLASS_NAME, nameof(verificationMethodId), verificationMethodId);
		Guards.object<T>(this.CLASS_NAME, nameof(data), data);

		const response = await this.fetch<IAttestationAttestRequest, IAttestationAttestResponse>(
			"/",
			"POST",
			{
				body: {
					verificationMethodId,
					address,
					data,
					namespace: options?.namespace
				}
			}
		);

		return response.body.information as IAttestationInformation<T>;
	}

	/**
	 * Resolve and verify the attestation id.
	 * @param attestationId The attestation id to verify.
	 * @returns The verified attestation details.
	 */
	public async verify<T>(attestationId: string): Promise<{
		verified: boolean;
		failure?: string;
		information?: Partial<IAttestationInformation<T>>;
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
			information: response.body.information as IAttestationInformation<T>
		};
	}

	/**
	 * Transfer the attestation to a new holder.
	 * @param attestationId The attestation to transfer.
	 * @param holderIdentity The holder identity of the attestation.
	 * @param holderAddress The new controller address of the attestation belonging to the holder.
	 * @returns The updated attestation details.
	 */
	public async transfer<T = unknown>(
		attestationId: string,
		holderIdentity: string,
		holderAddress: string
	): Promise<IAttestationInformation<T>> {
		Urn.guard(this.CLASS_NAME, nameof(attestationId), attestationId);
		Guards.stringValue(this.CLASS_NAME, nameof(holderIdentity), holderIdentity);
		Guards.stringValue(this.CLASS_NAME, nameof(holderAddress), holderAddress);

		const response = await this.fetch<IAttestationTransferRequest, IAttestationTransferResponse>(
			"/:id/transfer",
			"PUT",
			{
				pathParams: {
					id: attestationId
				},
				body: {
					holderAddress,
					holderIdentity
				}
			}
		);

		return response.body.information as IAttestationInformation<T>;
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
