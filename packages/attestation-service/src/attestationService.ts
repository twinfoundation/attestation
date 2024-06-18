// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	AttestationConnectorFactory,
	type IAttestation,
	type IAttestationConnector,
	type IAttestationInformation
} from "@gtsc/attestation-models";
import { GeneralError, Guards, Urn } from "@gtsc/core";
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
	 * The default namespace for the connector to use.
	 * @internal
	 */
	private readonly _defaultNamespace: string;

	/**
	 * Create a new instance of AttestationService.
	 * @param config The configuration for the service.
	 */
	constructor(config?: IAttestationServiceConfig) {
		const names = AttestationConnectorFactory.names();
		if (names.length === 0) {
			throw new GeneralError(AttestationService._CLASS_NAME, "noConnectors");
		}

		this._defaultNamespace = config?.defaultNamespace ?? names[0];
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
		Guards.stringValue(
			AttestationService._CLASS_NAME,
			nameof(controllerAddress),
			controllerAddress
		);
		Guards.stringValue(
			AttestationService._CLASS_NAME,
			nameof(verificationMethodId),
			verificationMethodId
		);
		Guards.stringValue(AttestationService._CLASS_NAME, nameof(dataId), dataId);
		Guards.stringValue(AttestationService._CLASS_NAME, nameof(type), type);
		Guards.object<T>(AttestationService._CLASS_NAME, nameof(data), data);

		try {
			const connectorNamespace = options?.namespace ?? this._defaultNamespace;

			const attestationConnector =
				AttestationConnectorFactory.get<IAttestationConnector>(connectorNamespace);

			return attestationConnector.attest(
				requestContext,
				controllerAddress,
				verificationMethodId,
				dataId,
				type,
				data
			);
		} catch (error) {
			throw new GeneralError(AttestationService._CLASS_NAME, "attestFailed", undefined, error);
		}
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
		Urn.guard(AttestationService._CLASS_NAME, nameof(attestationId), attestationId);

		try {
			const idUri = Urn.fromValidString(attestationId);
			const connectorNamespace = idUri.namespaceIdentifier();

			const attestationConnector =
				AttestationConnectorFactory.get<IAttestationConnector>(connectorNamespace);

			return attestationConnector.verify(requestContext, attestationId);
		} catch (error) {
			throw new GeneralError(AttestationService._CLASS_NAME, "verifyFailed", undefined, error);
		}
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
		Urn.guard(AttestationService._CLASS_NAME, nameof(attestationId), attestationId);
		Guards.stringValue(
			AttestationService._CLASS_NAME,
			nameof(holderControllerAddress),
			holderControllerAddress
		);
		Guards.stringValue(AttestationService._CLASS_NAME, nameof(holderIdentity), holderIdentity);

		try {
			const idUri = Urn.fromValidString(attestationId);
			const connectorNamespace = idUri.namespaceIdentifier();

			const attestationConnector =
				AttestationConnectorFactory.get<IAttestationConnector>(connectorNamespace);

			return attestationConnector.transfer(
				requestContext,
				attestationId,
				holderControllerAddress,
				holderIdentity
			);
		} catch (error) {
			throw new GeneralError(AttestationService._CLASS_NAME, "transferFailed", undefined, error);
		}
	}
}
