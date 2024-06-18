// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { BaseRestClient, type IBaseRestClientConfig } from "@gtsc/api-models";
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
	 * Attest the data and return the collated information.
	 * @param requestContext The context for the request.
	 * @param controllerAddress The controller address for the attestation.
	 * @param verificationMethodId The identity verification method to use for attesting the data.
	 * @param dataId An identifier to uniquely identify the attestation data.
	 * @param type The type which the data adheres to.
	 * @param data The data to attest.
	 * @param options Additional options for the attestation service.
	 * @param options.namespace The namespace of the connector to use for the attestation, defaults to service configured namespace.
	 * @returns The collated attestation data.
	 */
	public async attest<T = unknown>(
		requestContext: IRequestContext,
		controllerAddress: string,
		verificationMethodId: string,
		dataId: string,
		type: string,
		data: T,
		options?: {
			namespace?: string;
		}
	): Promise<IAttestationInformation<T>> {
		Guards.object<IRequestContext>(
			AttestationClient._CLASS_NAME,
			nameof(requestContext),
			requestContext
		);
		Guards.stringValue(
			AttestationClient._CLASS_NAME,
			nameof(requestContext.tenantId),
			requestContext.tenantId
		);
		Guards.stringValue(
			AttestationClient._CLASS_NAME,
			nameof(requestContext.identity),
			requestContext.identity
		);
		Guards.stringValue(AttestationClient._CLASS_NAME, nameof(controllerAddress), controllerAddress);
		Guards.stringValue(
			AttestationClient._CLASS_NAME,
			nameof(verificationMethodId),
			verificationMethodId
		);
		Guards.stringValue(AttestationClient._CLASS_NAME, nameof(dataId), dataId);
		Guards.stringValue(AttestationClient._CLASS_NAME, nameof(type), type);
		Guards.object<T>(AttestationClient._CLASS_NAME, nameof(data), data);

		const response = await this.fetch<IAttestationAttestRequest, IAttestationAttestResponse<T>>(
			requestContext,
			"/sign",
			"POST",
			{
				body: {
					verificationMethodId,
					controllerAddress,
					dataId,
					type,
					data,
					namespace: options?.namespace
				}
			}
		);

		return response.body.information;
	}

	/**
	 * Resolve and verify the attestation id.
	 * @param requestContext The context for the request.
	 * @param attestationId The attestation id to verify.
	 * @returns The verified attestation details.
	 */
	public async verify<T>(
		requestContext: IRequestContext,
		attestationId: string
	): Promise<{
		verified: boolean;
		failure?: string;
		information?: Partial<IAttestationInformation<T>>;
	}> {
		Guards.object<IRequestContext>(
			AttestationClient._CLASS_NAME,
			nameof(requestContext),
			requestContext
		);
		Guards.stringValue(
			AttestationClient._CLASS_NAME,
			nameof(requestContext.tenantId),
			requestContext.tenantId
		);
		Guards.stringValue(
			AttestationClient._CLASS_NAME,
			nameof(requestContext.identity),
			requestContext.identity
		);
		Urn.guard(AttestationClient._CLASS_NAME, nameof(attestationId), attestationId);

		const response = await this.fetch<IAttestationVerifyRequest, IAttestationVerifyResponse<T>>(
			requestContext,
			"/verify/:attestationId",
			"GET",
			{
				path: {
					attestationId
				}
			}
		);

		return response.body;
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
		Guards.object<IRequestContext>(
			AttestationClient._CLASS_NAME,
			nameof(requestContext),
			requestContext
		);
		Guards.stringValue(
			AttestationClient._CLASS_NAME,
			nameof(requestContext.tenantId),
			requestContext.tenantId
		);
		Guards.stringValue(
			AttestationClient._CLASS_NAME,
			nameof(requestContext.identity),
			requestContext.identity
		);
		Urn.guard(AttestationClient._CLASS_NAME, nameof(attestationId), attestationId);
		Guards.stringValue(
			AttestationClient._CLASS_NAME,
			nameof(holderControllerAddress),
			holderControllerAddress
		);
		Guards.stringValue(AttestationClient._CLASS_NAME, nameof(holderIdentity), holderIdentity);

		const response = await this.fetch<IAttestationTransferRequest, IAttestationTransferResponse<T>>(
			requestContext,
			"/transfer/:attestationId",
			"PUT",
			{
				path: {
					attestationId
				},
				body: {
					holderControllerAddress,
					holderIdentity
				}
			}
		);

		return response.body.information;
	}
}
