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
import type { IServiceRequestContext } from "@gtsc/services";
import type { IAttestationServiceConfig } from "./models/IAttestationServiceConfig";

/**
 * Service for performing attestation operations to a connector.
 */
export class AttestationService implements IAttestation {
	/**
	 * The namespace supported by the attestation service.
	 */
	public static readonly NAMESPACE: string = "attestation";

	/**
	 * Runtime name for the class.
	 */
	public readonly CLASS_NAME: string = nameof<AttestationService>();

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
			throw new GeneralError(this.CLASS_NAME, "noConnectors");
		}

		this._defaultNamespace = config?.defaultNamespace ?? names[0];
	}

	/**
	 * Attest the data and return the collated information.
	 * @param controllerAddress The controller address for the attestation.
	 * @param verificationMethodId The identity verification method to use for attesting the data.
	 * @param data The data to attest.
	 * @param options Additional options for the attestation service.
	 * @param options.namespace The namespace of the connector to use for the attestation, defaults to service configured namespace.
	 * @param requestContext The context for the request.
	 * @returns The collated attestation data.
	 */
	public async attest<T = unknown>(
		controllerAddress: string,
		verificationMethodId: string,
		data: T,
		options?: {
			namespace?: string;
		},
		requestContext?: IServiceRequestContext
	): Promise<IAttestationInformation<T>> {
		Guards.stringValue(this.CLASS_NAME, nameof(controllerAddress), controllerAddress);
		Guards.stringValue(this.CLASS_NAME, nameof(verificationMethodId), verificationMethodId);
		Guards.object<T>(this.CLASS_NAME, nameof(data), data);

		try {
			const connectorNamespace = options?.namespace ?? this._defaultNamespace;

			const attestationConnector =
				AttestationConnectorFactory.get<IAttestationConnector>(connectorNamespace);

			return attestationConnector.attest(
				controllerAddress,
				verificationMethodId,
				data,
				requestContext
			);
		} catch (error) {
			throw new GeneralError(this.CLASS_NAME, "attestFailed", undefined, error);
		}
	}

	/**
	 * Resolve and verify the attestation id.
	 * @param attestationId The attestation id to verify.
	 * @param requestContext The context for the request.
	 * @returns The verified attestation details.
	 */
	public async verify<T>(
		attestationId: string,
		requestContext?: IServiceRequestContext
	): Promise<{
		verified: boolean;
		failure?: string;
		information?: Partial<IAttestationInformation<T>>;
	}> {
		Urn.guard(this.CLASS_NAME, nameof(attestationId), attestationId);

		try {
			const attestationConnector = this.getConnector(attestationId);

			return attestationConnector.verify(attestationId, requestContext);
		} catch (error) {
			throw new GeneralError(this.CLASS_NAME, "verifyFailed", undefined, error);
		}
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
		Urn.guard(this.CLASS_NAME, nameof(attestationId), attestationId);
		Guards.stringValue(this.CLASS_NAME, nameof(holderControllerAddress), holderControllerAddress);
		Guards.stringValue(this.CLASS_NAME, nameof(holderIdentity), holderIdentity);

		try {
			const attestationConnector = this.getConnector(attestationId);

			return attestationConnector.transfer(
				attestationId,
				holderControllerAddress,
				holderIdentity,
				requestContext
			);
		} catch (error) {
			throw new GeneralError(this.CLASS_NAME, "transferFailed", undefined, error);
		}
	}

	/**
	 * Get the connector from the uri.
	 * @param id The id of the attestation in urn format.
	 * @returns The connector.
	 * @internal
	 */
	private getConnector(id: string): IAttestationConnector {
		const idUri = Urn.fromValidString(id);

		if (idUri.namespaceIdentifier() !== AttestationService.NAMESPACE) {
			throw new GeneralError(this.CLASS_NAME, "namespaceMismatch", {
				namespace: AttestationService.NAMESPACE,
				id
			});
		}

		return AttestationConnectorFactory.get<IAttestationConnector>(idUri.namespaceMethod());
	}
}
