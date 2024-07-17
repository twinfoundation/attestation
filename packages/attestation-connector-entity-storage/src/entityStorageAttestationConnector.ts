// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAttestationConnector, IAttestationInformation } from "@gtsc/attestation-models";
import { NotImplementedError } from "@gtsc/core";
import { nameof } from "@gtsc/nameof";
import type { IServiceRequestContext } from "@gtsc/services";
import type { IEntityStorageAttestationConnectorConfig } from "./models/IEntityStorageAttestationConnectorConfig";

/**
 * Class for performing attestation operations in entity storage.
 */
export class EntityStorageAttestationConnector implements IAttestationConnector {
	/**
	 * The namespace for the entities.
	 */
	public static readonly NAMESPACE: string = "entity-attestation";

	/**
	 * Runtime name for the class.
	 */
	public readonly CLASS_NAME: string = nameof<EntityStorageAttestationConnector>();

	/**
	 * The configuration for the attestation connector.
	 */
	private readonly _config: IEntityStorageAttestationConnectorConfig;

	/**
	 * Create a new instance of EntityStorageAttestationConnector.
	 * @param options The dependencies for the attestation connector.
	 * @param options.config The configuration for the attestation connector.
	 */
	constructor(options?: { config?: IEntityStorageAttestationConnectorConfig }) {
		this._config = options?.config ?? {};
	}

	/**
	 * Attest the data and return the collated information.
	 * @param controllerAddress The controller address for the attestation.
	 * @param verificationMethodId The identity verification method to use for attesting the data.
	 * @param data The data to attest.
	 * @param requestContext The context for the request.
	 * @returns The collated attestation data.
	 */
	public async attest<T = unknown>(
		controllerAddress: string,
		verificationMethodId: string,
		data: T,
		requestContext?: IServiceRequestContext
	): Promise<IAttestationInformation<T>> {
		throw new NotImplementedError(this.CLASS_NAME, "attest");
	}

	/**
	 * Resolve and verify the attestation id.
	 * @param attestationId The attestation id to verify.
	 * @param requestContext The context for the request.
	 * @returns The verified attestation details.
	 */
	public async verify<T = unknown>(
		attestationId: string,
		requestContext?: IServiceRequestContext
	): Promise<{
		verified: boolean;
		failure?: string;
		information?: Partial<IAttestationInformation<T>>;
	}> {
		throw new NotImplementedError(this.CLASS_NAME, "verify");
	}

	/**
	 * Transfer the attestation to a new holder.
	 * @param attestationId The attestation to transfer.
	 * @param holderControllerAddress The new controller address of the attestation belonging to the holder.
	 * @param holderIdentity The holder identity of the attestation.
	 * @param requestContext The context for the request.
	 * @returns The updated attestation details.
	 */
	public async transfer<T = unknown>(
		attestationId: string,
		holderControllerAddress: string,
		holderIdentity: string,
		requestContext?: IServiceRequestContext
	): Promise<IAttestationInformation<T>> {
		throw new NotImplementedError(this.CLASS_NAME, "transfer");
	}
}
