// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAttestationConnector, IAttestationInformation } from "@twin.org/attestation-models";
import { Coerce, GeneralError, Guards, Is, Urn } from "@twin.org/core";
import { IdentityConnectorFactory, type IIdentityConnector } from "@twin.org/identity-models";
import { nameof } from "@twin.org/nameof";
import { NftConnectorFactory, type INftConnector } from "@twin.org/nft-models";
import type { IDidVerifiableCredential } from "@twin.org/standards-w3c-did";
import { EntityStorageAttestationUtils } from "./entityStorageAttestationUtils";
import type { IEntityStorageAttestationConnectorConfig } from "./models/IEntityStorageAttestationConnectorConfig";
import type { IEntityStorageAttestationHolder } from "./models/IEntityStorageAttestationHolder";
import type { IEntityStorageAttestationPayload } from "./models/IEntityStorageAttestationPayload";

/**
 * Class for performing attestation operations in entity storage.
 */
export class EntityStorageAttestationConnector implements IAttestationConnector {
	/**
	 * The namespace for the entities.
	 */
	public static readonly NAMESPACE: string = "entity-storage";

	/**
	 * Default tag.
	 * @internal
	 */
	private static readonly _DEFAULT_TAG: string = "TWIN-ATTESTATION";

	/**
	 * Runtime name for the class.
	 */
	public readonly CLASS_NAME: string = nameof<EntityStorageAttestationConnector>();

	/**
	 * Connector for identity operations.
	 * @internal
	 */
	private readonly _identityConnector: IIdentityConnector;

	/**
	 * Connector for nft operations.
	 * @internal
	 */
	private readonly _nftConnector: INftConnector;

	/**
	 * The configuration for the connector.
	 * @internal
	 */
	private readonly _config: IEntityStorageAttestationConnectorConfig;

	/**
	 * Create a new instance of EntityStorageAttestationConnector.
	 * @param options The dependencies for the attestation connector.
	 * @param options.identityConnectorType The type of the identity connector, defaults to "identity".
	 * @param options.nftConnectorType The type of the nft connector, defaults to "nft".
	 * @param options.config The configuration for the connector.
	 */
	constructor(options?: {
		identityConnectorType?: string;
		nftConnectorType?: string;
		config?: IEntityStorageAttestationConnectorConfig;
	}) {
		this._identityConnector = IdentityConnectorFactory.get(
			options?.identityConnectorType ?? "identity"
		);
		this._nftConnector = NftConnectorFactory.get(options?.nftConnectorType ?? "nft");
		this._config = options?.config ?? {};
		this._config.tag ??= EntityStorageAttestationConnector._DEFAULT_TAG;
	}

	/**
	 * Attest the data and return the collated information.
	 * @param controller The controller identity of the user to access the vault keys.
	 * @param address The controller address for the attestation.
	 * @param verificationMethodId The identity verification method to use for attesting the data.
	 * @param data The data to attest.
	 * @returns The collated attestation data.
	 */
	public async attest<T = unknown>(
		controller: string,
		address: string,
		verificationMethodId: string,
		data: T
	): Promise<IAttestationInformation<T>> {
		Guards.stringValue(this.CLASS_NAME, nameof(controller), controller);
		Guards.stringValue(this.CLASS_NAME, nameof(address), address);
		Guards.stringValue(this.CLASS_NAME, nameof(verificationMethodId), verificationMethodId);
		Guards.object<T>(this.CLASS_NAME, nameof(data), data);

		try {
			const verifiableCredential = await this._identityConnector.createVerifiableCredential(
				controller,
				verificationMethodId,
				undefined,
				undefined,
				data
			);

			const attestationPayload: IEntityStorageAttestationPayload = {
				version: "1",
				proof: verifiableCredential.jwt
			};

			const holder: IEntityStorageAttestationHolder = {};

			const nftId = await this._nftConnector.mint(
				controller,
				address,
				this._config.tag ?? EntityStorageAttestationConnector._DEFAULT_TAG,
				attestationPayload,
				holder
			);

			// Convert the nftId urn to a form we can use as the namespace specific part of the
			// attestation urn but can be decoded back to the nftId, as we need to maintain the
			// details of which connector created the NFT
			const attestationId = EntityStorageAttestationUtils.nftIdToAttestationId(nftId);

			const attestationInformation: IAttestationInformation<T> = {
				id: attestationId,
				created: verifiableCredential.verifiableCredential?.issuanceDate ?? "",
				ownerIdentity: verifiableCredential.verifiableCredential.issuer ?? "",
				holderIdentity: verifiableCredential.verifiableCredential.issuer ?? "",
				data,
				proof: {
					type: "jwt",
					value: verifiableCredential.jwt
				}
			};

			return attestationInformation;
		} catch (error) {
			throw new GeneralError(this.CLASS_NAME, "attestingFailed", undefined, error);
		}
	}

	/**
	 * Resolve and verify the attestation id.
	 * @param attestationId The attestation id to verify.
	 * @returns The verified attestation details.
	 */
	public async verify<T = unknown>(
		attestationId: string
	): Promise<{
		verified: boolean;
		failure?: string;
		information?: Partial<IAttestationInformation<T>>;
	}> {
		Urn.guard(this.CLASS_NAME, nameof(attestationId), attestationId);

		const urnParsed = Urn.fromValidString(attestationId);

		if (urnParsed.namespaceMethod() !== EntityStorageAttestationConnector.NAMESPACE) {
			throw new GeneralError(this.CLASS_NAME, "namespaceMismatch", {
				namespace: EntityStorageAttestationConnector.NAMESPACE,
				attestationId
			});
		}

		try {
			const nftId = EntityStorageAttestationUtils.attestationIdToNftId(attestationId);

			const resolved = await this._nftConnector.resolve<
				IEntityStorageAttestationPayload,
				IEntityStorageAttestationHolder
			>(nftId);

			let failure: string | undefined;
			let checkResult:
				| {
						revoked: boolean;
						verifiableCredential?: IDidVerifiableCredential<T>;
				  }
				| undefined;

			const jwtProof = Coerce.string(resolved.immutableMetadata?.proof);
			if (Is.empty(jwtProof) || Is.empty(resolved.metadata)) {
				failure = `${this.CLASS_NAME}.verificationFailures.noData`;
			} else {
				checkResult = await this._identityConnector.checkVerifiableCredential(jwtProof);

				if (Is.empty(checkResult.verifiableCredential)) {
					failure = `${this.CLASS_NAME}.verificationFailures.proofFailed`;
				} else if (checkResult.revoked) {
					failure = `${this.CLASS_NAME}.verificationFailures.revoked`;
				}
			}

			const information: Partial<IAttestationInformation<T>> = {
				id: attestationId,
				created: checkResult?.verifiableCredential?.issuanceDate,
				ownerIdentity: checkResult?.verifiableCredential?.issuer,
				holderIdentity: checkResult?.verifiableCredential?.issuer,
				data: checkResult?.verifiableCredential?.credentialSubject as T
			};

			if (Is.stringValue(jwtProof)) {
				information.proof = Is.stringValue(jwtProof)
					? {
							type: "jwt",
							value: jwtProof
						}
					: undefined;
			}

			if (
				Is.object<IEntityStorageAttestationHolder>(resolved.metadata) &&
				Is.stringValue(resolved.metadata.holderIdentity) &&
				Is.stringValue(resolved.metadata.transferred)
			) {
				information.holderIdentity = resolved.metadata.holderIdentity;
				information.transferred = resolved.metadata.transferred;
			}

			return {
				verified: Is.empty(failure),
				failure,
				information
			};
		} catch (error) {
			throw new GeneralError(this.CLASS_NAME, "verificationFailed", undefined, error);
		}
	}

	/**
	 * Transfer the attestation to a new holder.
	 * @param controller The controller identity of the user to access the vault keys.
	 * @param attestationId The attestation to transfer.
	 * @param holderIdentity The holder identity of the attestation.
	 * @param holderAddress The new controller address of the attestation belonging to the holder.
	 * @returns The updated attestation details.
	 */
	public async transfer<T = unknown>(
		controller: string,
		attestationId: string,
		holderIdentity: string,
		holderAddress: string
	): Promise<IAttestationInformation<T>> {
		Guards.stringValue(this.CLASS_NAME, nameof(controller), controller);
		Urn.guard(this.CLASS_NAME, nameof(attestationId), attestationId);
		Guards.stringValue(this.CLASS_NAME, nameof(holderIdentity), holderIdentity);
		Guards.stringValue(this.CLASS_NAME, nameof(holderAddress), holderAddress);

		const urnParsed = Urn.fromValidString(attestationId);

		if (urnParsed.namespaceMethod() !== EntityStorageAttestationConnector.NAMESPACE) {
			throw new GeneralError(this.CLASS_NAME, "namespaceMismatch", {
				namespace: EntityStorageAttestationConnector.NAMESPACE,
				attestationId
			});
		}

		try {
			const verificationResult = await this.verify<T>(attestationId);
			if (Is.stringValue(verificationResult.failure)) {
				throw new GeneralError(
					this.CLASS_NAME,
					"verificationFailed",
					undefined,
					new GeneralError(this.CLASS_NAME, verificationResult.failure)
				);
			}

			const nftId = EntityStorageAttestationUtils.attestationIdToNftId(attestationId);

			const holder: IEntityStorageAttestationHolder = {
				transferred: new Date().toISOString(),
				holderIdentity
			};

			await this._nftConnector.transfer(controller, nftId, holderAddress, holder);

			return {
				...(verificationResult.information as IAttestationInformation<T>),
				...holder
			};
		} catch (error) {
			throw new GeneralError(this.CLASS_NAME, "transferFailed", undefined, error);
		}
	}

	/**
	 * Destroy the attestation.
	 * @param controller The controller identity of the user to access the vault keys.
	 * @param attestationId The attestation to destroy.
	 * @returns Nothing.
	 */
	public async destroy(controller: string, attestationId: string): Promise<void> {
		Guards.stringValue(this.CLASS_NAME, nameof(controller), controller);
		Urn.guard(this.CLASS_NAME, nameof(attestationId), attestationId);

		const urnParsed = Urn.fromValidString(attestationId);

		if (urnParsed.namespaceMethod() !== EntityStorageAttestationConnector.NAMESPACE) {
			throw new GeneralError(this.CLASS_NAME, "namespaceMismatch", {
				namespace: EntityStorageAttestationConnector.NAMESPACE,
				attestationId
			});
		}

		try {
			const nftId = EntityStorageAttestationUtils.attestationIdToNftId(attestationId);

			await this._nftConnector.burn(controller, nftId);
		} catch (error) {
			throw new GeneralError(this.CLASS_NAME, "destroyFailed", undefined, error);
		}
	}
}
