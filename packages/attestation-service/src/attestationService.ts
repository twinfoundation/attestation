// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	AttestationConnectorFactory,
	type IAttestation,
	type IAttestationConnector,
	type IAttestationProof
} from "@gtsc/attestation-models";
import type { IBlobStorageConnector } from "@gtsc/blob-storage-models";
import { Converter, GeneralError, Guards, Is, NotFoundError, Urn } from "@gtsc/core";
import { nameof } from "@gtsc/nameof";
import type { IRequestContext } from "@gtsc/services";
import type { IAttestationServiceConfig } from "./models/IAttestationServiceConfig";

/**
 * Service for performing attestation operations to a connector.
 */
export class AttestationService implements IAttestation {
	/**
	 * Runtime name for the class.
	 * @internal
	 */
	private static readonly _CLASS_NAME: string = nameof<AttestationService>();

	/**
	 * The connection to the blob storage.
	 * @internal
	 */
	private readonly _blobStorageConnection: IBlobStorageConnector;

	/**
	 * The default namespace for the connector to use.
	 * @internal
	 */
	private readonly _defaultNamespace: string;

	/**
	 * Create a new instance of AttestationService.
	 * @param dependencies The connectors to use.
	 * @param dependencies.blobStorageConnection The connection to the blob storage.
	 * @param config The configuration for the service.
	 */
	constructor(
		dependencies: {
			blobStorageConnection: IBlobStorageConnector;
		},
		config?: IAttestationServiceConfig
	) {
		Guards.object(AttestationService._CLASS_NAME, nameof(dependencies), dependencies);
		Guards.object<IBlobStorageConnector>(
			AttestationService._CLASS_NAME,
			nameof(dependencies.blobStorageConnection),
			dependencies.blobStorageConnection
		);
		this._blobStorageConnection = dependencies.blobStorageConnection;

		const names = AttestationConnectorFactory.names();
		if (names.length === 0) {
			throw new GeneralError(AttestationService._CLASS_NAME, "noConnectors");
		}

		this._defaultNamespace = config?.defaultNamespace ?? names[0];
	}

	/**
	 * Sign the data and return the proof.
	 * @param requestContext The context for the request.
	 * @param keyId The key id from a vault to sign the data.
	 * @param data The data to store in blob storage and sign as base64.
	 * @param options Additional options for the attestation service.
	 * @param options.namespace The namespace to use for storing, defaults to service configured namespace.
	 * @returns The proof for the data with the id set as a unique identifier for the data.
	 */
	public async sign(
		requestContext: IRequestContext,
		keyId: string,
		data: string,
		options?: {
			namespace?: string;
		}
	): Promise<IAttestationProof> {
		Guards.object<IRequestContext>(
			AttestationService._CLASS_NAME,
			nameof(requestContext),
			requestContext
		);
		Guards.stringValue(
			AttestationService._CLASS_NAME,
			nameof(requestContext.tenantId),
			requestContext.tenantId
		);
		Guards.stringValue(
			AttestationService._CLASS_NAME,
			nameof(requestContext.identity),
			requestContext.identity
		);
		Guards.stringValue(AttestationService._CLASS_NAME, nameof(keyId), keyId);
		Guards.stringBase64(AttestationService._CLASS_NAME, nameof(data), data);

		try {
			const binary = Converter.base64ToBytes(data);

			const blobStorageId = await this._blobStorageConnection.set(requestContext, binary);

			const connectorNamespace = options?.namespace ?? this._defaultNamespace;

			const attestationConnector =
				AttestationConnectorFactory.get<IAttestationConnector>(connectorNamespace);

			const proof = await attestationConnector.sign(requestContext, keyId, data);

			return {
				blobStorageId,
				...proof
			};
		} catch (error) {
			throw new GeneralError(AttestationService._CLASS_NAME, "signFailed", undefined, error);
		}
	}

	/**
	 * Verify the data against the proof.
	 * @param requestContext The context for the request.
	 * @param proof The proof to verify against.
	 * @returns True if the verification is successful.
	 */
	public async verify(requestContext: IRequestContext, proof: IAttestationProof): Promise<boolean> {
		Guards.object<IRequestContext>(
			AttestationService._CLASS_NAME,
			nameof(requestContext),
			requestContext
		);
		Guards.stringValue(
			AttestationService._CLASS_NAME,
			nameof(requestContext.tenantId),
			requestContext.tenantId
		);
		Guards.object<IAttestationProof>(AttestationService._CLASS_NAME, nameof(proof), proof);
		Urn.guard(AttestationService._CLASS_NAME, nameof(proof.id), proof.id);

		try {
			const binary = await this._blobStorageConnection.get(requestContext, proof.blobStorageId);

			if (Is.undefined(binary)) {
				throw new NotFoundError(
					AttestationService._CLASS_NAME,
					"blobNotFound",
					proof.blobStorageId
				);
			}

			const base64 = Converter.bytesToBase64(binary);

			const idUri = Urn.fromValidString(proof.id);
			const connectorNamespace = idUri.namespaceIdentifier();

			const attestationConnector =
				AttestationConnectorFactory.get<IAttestationConnector>(connectorNamespace);

			return attestationConnector.verify(requestContext, base64, proof);
		} catch (error) {
			throw new GeneralError(AttestationService._CLASS_NAME, "verifyFailed", undefined, error);
		}
	}
}
