// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { BaseRestClient } from "@gtsc/api-core";
import type { IBaseRestClientConfig } from "@gtsc/api-models";
import type {
	IAttestation,
	IAttestationAttestRequest,
	IAttestationAttestResponse,
	IAttestationInformation,
	IAttestationTransferRequest,
	IAttestationTransferResponse,
	IAttestationVerifyRequest,
	IAttestationVerifyResponse
} from "@gtsc/attestation-models";
import { Guards, StringHelper, Urn } from "@gtsc/core";
import { nameof } from "@gtsc/nameof";

/**
 * Client for performing attestation through to REST endpoints.
 */
export class AttestationClient extends BaseRestClient implements IAttestation {
	/**
	 * Runtime name for the class.
	 */
	public readonly CLASS_NAME: string = nameof<AttestationClient>();

	/**
	 * Create a new instance of AttestationClient.
	 * @param config The configuration for the client.
	 */
	constructor(config: IBaseRestClientConfig) {
		super(nameof<AttestationClient>(), config, StringHelper.kebabCase(nameof<IAttestation>()));
	}

	/**
	 * Attest the data and return the collated information.
	 * @param controllerAddress The controller address for the attestation.
	 * @param verificationMethodId The identity verification method to use for attesting the data.
	 * @param data The data to attest.
	 * @param options Additional options for the attestation service.
	 * @param options.namespace The namespace of the connector to use for the attestation, defaults to service configured namespace.
	 * @returns The collated attestation data.
	 */
	public async attest<T = unknown>(
		controllerAddress: string,
		verificationMethodId: string,
		data: T,
		options?: {
			namespace?: string;
		}
	): Promise<IAttestationInformation<T>> {
		Guards.stringValue(this.CLASS_NAME, nameof(controllerAddress), controllerAddress);
		Guards.stringValue(this.CLASS_NAME, nameof(verificationMethodId), verificationMethodId);
		Guards.object<T>(this.CLASS_NAME, nameof(data), data);

		const response = await this.fetch<IAttestationAttestRequest, IAttestationAttestResponse>(
			"/",
			"POST",
			{
				body: {
					verificationMethodId,
					controllerAddress,
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
	 * @param holderControllerAddress The new controller address of the attestation belonging to the holder.
	 * @param holderIdentity The holder identity of the attestation.
	 * @returns The updated attestation details.
	 */
	public async transfer<T = unknown>(
		attestationId: string,
		holderControllerAddress: string,
		holderIdentity: string
	): Promise<IAttestationInformation<T>> {
		Urn.guard(this.CLASS_NAME, nameof(attestationId), attestationId);
		Guards.stringValue(this.CLASS_NAME, nameof(holderControllerAddress), holderControllerAddress);
		Guards.stringValue(this.CLASS_NAME, nameof(holderIdentity), holderIdentity);

		const response = await this.fetch<IAttestationTransferRequest, IAttestationTransferResponse>(
			"/:id/transfer",
			"PUT",
			{
				pathParams: {
					id: attestationId
				},
				body: {
					holderControllerAddress,
					holderIdentity
				}
			}
		);

		return response.body.information as IAttestationInformation<T>;
	}
}
