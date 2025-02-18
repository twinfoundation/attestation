// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	AttestationConnectorFactory,
	type IAttestationComponent,
	type IAttestationConnector,
	type IAttestationInformation
} from "@twin.org/attestation-models";
import { GeneralError, Guards, Is, Urn } from "@twin.org/core";
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";
import { nameof } from "@twin.org/nameof";
import { WalletConnectorFactory, type IWalletConnector } from "@twin.org/wallet-models";
import type { IAttestationServiceConstructorOptions } from "./models/IAttestationServiceConstructorOptions";

/**
 * Service for performing attestation operations to a connector.
 */
export class AttestationService implements IAttestationComponent {
	/**
	 * The namespace supported by the attestation service.
	 */
	public static readonly NAMESPACE: string = "attestation";

	/**
	 * Runtime name for the class.
	 */
	public readonly CLASS_NAME: string = nameof<AttestationService>();

	/**
	 * The wallet for generating addresses.
	 * @internal
	 */
	private readonly _walletConnector: IWalletConnector;

	/**
	 * The wallet address index to use for funding and controlling the attestations.
	 * @internal
	 */
	private readonly _walletAddressIndex: number;

	/**
	 * The default namespace for the connector to use.
	 * @internal
	 */
	private readonly _defaultNamespace: string;

	/**
	 * The node identity automatically gets added to the data payload being attested. This can be excluded if required.
	 * @internal
	 */
	private readonly _excludeNodeIdentity: boolean;

	/**
	 * The verification method id to use for the attestation.
	 * @internal
	 */
	private readonly _verificationMethodId: string;

	/**
	 * Create a new instance of AttestationService.
	 * @param options The options for the service.
	 * @param options.config The configuration for the service.
	 * @param options.walletConnectorType The wallet connector type for generating addresses, defaults to "wallet".
	 */
	constructor(options?: IAttestationServiceConstructorOptions) {
		this._walletConnector = WalletConnectorFactory.get(options?.walletConnectorType ?? "wallet");

		const names = AttestationConnectorFactory.names();
		if (names.length === 0) {
			throw new GeneralError(this.CLASS_NAME, "noConnectors");
		}

		this._defaultNamespace = options?.config?.defaultNamespace ?? names[0];
		this._walletAddressIndex = options?.config?.walletAddressIndex ?? 0;
		this._excludeNodeIdentity = options?.config?.excludeNodeIdentity ?? false;
		this._verificationMethodId = options?.config?.verificationMethodId ?? "attestation-assertion";
	}

	/**
	 * Attest the data and return the collated information.
	 * @param attestationObject The data to attest.
	 * @param namespace The namespace of the connector to use for the attestation, defaults to service configured namespace.
	 * @param identity The identity to perform the attestation operation with.
	 * @param nodeIdentity The node identity to include in the attestation.
	 * @returns The id.
	 */
	public async create(
		attestationObject: IJsonLdNodeObject,
		namespace?: string,
		identity?: string,
		nodeIdentity?: string
	): Promise<string> {
		Guards.object<IJsonLdNodeObject>(this.CLASS_NAME, nameof(attestationObject), attestationObject);
		Guards.stringValue(this.CLASS_NAME, nameof(identity), identity);
		Guards.stringValue(this.CLASS_NAME, nameof(nodeIdentity), nodeIdentity);

		try {
			const connectorNamespace = namespace ?? this._defaultNamespace;

			const attestationConnector =
				AttestationConnectorFactory.get<IAttestationConnector>(connectorNamespace);

			if (Is.object<{ nodeIdentity?: string }>(attestationObject) && !this._excludeNodeIdentity) {
				attestationObject.nodeIdentity = nodeIdentity;
			}

			return attestationConnector.create(
				identity,
				`${nodeIdentity}#${this._verificationMethodId}`,
				attestationObject
			);
		} catch (error) {
			throw new GeneralError(this.CLASS_NAME, "attestFailed", undefined, error);
		}
	}

	/**
	 * Resolve and verify the attestation id.
	 * @param id The attestation id to verify.
	 * @returns The verified attestation details.
	 */
	public async get(id: string): Promise<IAttestationInformation> {
		Urn.guard(this.CLASS_NAME, nameof(id), id);

		try {
			const attestationConnector = this.getConnector(id);

			return attestationConnector.get(id);
		} catch (error) {
			throw new GeneralError(this.CLASS_NAME, "verifyFailed", undefined, error);
		}
	}

	/**
	 * Transfer the attestation to a new holder.
	 * @param attestationId The attestation to transfer.
	 * @param holderIdentity The identity to transfer the attestation to.
	 * @param identity The identity to perform the attestation operation with.
	 * @returns The updated attestation details.
	 */
	public async transfer(
		attestationId: string,
		holderIdentity: string,
		identity: string
	): Promise<void> {
		Urn.guard(this.CLASS_NAME, nameof(attestationId), attestationId);
		Guards.stringValue(this.CLASS_NAME, nameof(holderIdentity), holderIdentity);
		Guards.stringValue(this.CLASS_NAME, nameof(identity), identity);

		try {
			const attestationConnector = this.getConnector(attestationId);

			const addresses = await this._walletConnector.getAddresses(
				holderIdentity,
				0,
				this._walletAddressIndex,
				1
			);

			return attestationConnector.transfer(identity, attestationId, holderIdentity, addresses[0]);
		} catch (error) {
			throw new GeneralError(this.CLASS_NAME, "transferFailed", undefined, error);
		}
	}

	/**
	 * Destroy the attestation.
	 * @param attestationId The attestation to transfer.
	 * @param identity The identity to perform the attestation operation with.
	 * @returns The updated attestation details.
	 */
	public async destroy(attestationId: string, identity?: string): Promise<void> {
		Urn.guard(this.CLASS_NAME, nameof(attestationId), attestationId);
		Guards.stringValue(this.CLASS_NAME, nameof(identity), identity);

		try {
			const attestationConnector = this.getConnector(attestationId);

			return attestationConnector.destroy(identity, attestationId);
		} catch (error) {
			throw new GeneralError(this.CLASS_NAME, "destroyFailed", undefined, error);
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
