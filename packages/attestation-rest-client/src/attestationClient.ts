// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { BaseRestClient } from "@twin.org/api-core";
import type {
	IBaseRestClientConfig,
	ICreatedResponse,
	INoContentResponse
} from "@twin.org/api-models";
import type {
	IAttestationComponent,
	IAttestationCreateRequest,
	IAttestationDestroyRequest,
	IAttestationGetRequest,
	IAttestationGetResponse,
	IAttestationInformation,
	IAttestationTransferRequest
} from "@twin.org/attestation-models";
import { Guards, Urn } from "@twin.org/core";
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";
import { nameof } from "@twin.org/nameof";
import { HeaderTypes } from "@twin.org/web";

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
	 * @param attestationObject The data to attest.
	 * @param namespace The namespace of the connector to use for the attestation, defaults to component configured namespace.
	 * @returns The id.
	 */
	public async create(
		verificationMethodId: string,
		attestationObject: IJsonLdNodeObject,
		namespace?: string
	): Promise<string> {
		Guards.stringValue(this.CLASS_NAME, nameof(verificationMethodId), verificationMethodId);
		Guards.object<IJsonLdNodeObject>(this.CLASS_NAME, nameof(attestationObject), attestationObject);

		const response = await this.fetch<IAttestationCreateRequest, ICreatedResponse>("/", "POST", {
			body: {
				verificationMethodId,
				attestationObject,
				namespace
			}
		});

		return response.headers[HeaderTypes.Location];
	}

	/**
	 * Resolve and verify the attestation id.
	 * @param id The attestation id to verify.
	 * @returns The verified attestation details.
	 */
	public async get(id: string): Promise<IAttestationInformation> {
		Urn.guard(this.CLASS_NAME, nameof(id), id);

		const response = await this.fetch<IAttestationGetRequest, IAttestationGetResponse>(
			"/:id",
			"GET",
			{
				pathParams: {
					id
				}
			}
		);

		return response.body;
	}

	/**
	 * Transfer the attestation to a new holder.
	 * @param attestationId The attestation to transfer.
	 * @param holderIdentity The identity to transfer the attestation to.
	 * @param holderAddress The address to transfer the attestation to.
	 * @returns Nothing.
	 */
	public async transfer(
		attestationId: string,
		holderIdentity: string,
		holderAddress: string
	): Promise<void> {
		Urn.guard(this.CLASS_NAME, nameof(attestationId), attestationId);
		Guards.stringValue(this.CLASS_NAME, nameof(holderIdentity), holderIdentity);
		Guards.stringValue(this.CLASS_NAME, nameof(holderAddress), holderAddress);

		await this.fetch<IAttestationTransferRequest, INoContentResponse>("/:id/transfer", "PUT", {
			pathParams: {
				id: attestationId
			},
			body: {
				holderIdentity,
				holderAddress
			}
		});
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
