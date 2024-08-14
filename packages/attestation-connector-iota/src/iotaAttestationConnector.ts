// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAttestationConnector, IAttestationInformation } from "@gtsc/attestation-models";
import { Coerce, GeneralError, Guards, Is, Urn } from "@gtsc/core";
import { IdentityConnectorFactory, type IIdentityConnector } from "@gtsc/identity-models";
import { nameof } from "@gtsc/nameof";
import { NftConnectorFactory, type INftConnector } from "@gtsc/nft-models";
import type { IDidVerifiableCredential } from "@gtsc/standards-w3c-did";
import { IotaAttestationUtils } from "./iotaAttestationUtils";
import type { IIotaAttestationConnectorConfig } from "./models/IIotaAttestationConnectorConfig";
import type { IIotaAttestationHolder } from "./models/IIotaAttestationHolder";
import type { IIotaAttestationPayload } from "./models/IIotaAttestationPayload";

/**
 * Class for performing attestation operations on IOTA network.
 */
export class IotaAttestationConnector implements IAttestationConnector {
	/**
	 * The namespace for the entities.
	 */
	public static readonly NAMESPACE: string = "iota";

	/**
	 * Default tag.
	 * @internal
	 */
	private static readonly _DEFAULT_TAG: string = "GTSC-ATTESTATION";

	/**
	 * Runtime name for the class.
	 */
	public readonly CLASS_NAME: string = nameof<IotaAttestationConnector>();

	/**
	 * Connector for identity operations.
	 * @internal
	 */
	private readonly _identityConnector: IIdentityConnector;

	/**
	 * Connector for NFT operations.
	 * @internal
	 */
	private readonly _nftConnector: INftConnector;

	/**
	 * The configuration for the connector.
	 * @internal
	 */
	private readonly _config: IIotaAttestationConnectorConfig;

	/**
	 * Create a new instance of IotaAttestationConnector.
	 * @param options The options for the class.
	 * @param options.identityConnectorType The identity connector type, defaults to "identity".
	 * @param options.nftConnectorType The nft connector type, defaults to "nft".
	 * @param options.config The configuration for the connector.
	 */
	constructor(options?: {
		identityConnectorType?: string;
		nftConnectorType?: string;
		config?: IIotaAttestationConnectorConfig;
	}) {
		this._identityConnector = IdentityConnectorFactory.get(
			options?.identityConnectorType ?? "identity"
		);
		this._nftConnector = NftConnectorFactory.get(options?.nftConnectorType ?? "nft");
		this._config = options?.config ?? {};
		this._config.tag ??= IotaAttestationConnector._DEFAULT_TAG;
	}

	/**
	 * Attest the data and return the collated information.
	 * @param controller The controller identity of the user to access the vault keys.
	 * @param address The controlling address for the attestation.
	 * @param verificationMethodId The identity verification method to use for attesting the data.
	 * @param data The data to attest.
	 * @returns The collated attestation data.
	 */
	public async attest<T>(
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

			const attestationPayload: IIotaAttestationPayload = {
				version: "1",
				proof: verifiableCredential.jwt
			};

			const holder: IIotaAttestationHolder = {};

			const nftId = await this._nftConnector.mint(
				controller,
				address,
				this._config.tag ?? IotaAttestationConnector._DEFAULT_TAG,
				attestationPayload,
				holder
			);

			// Convert the nftId urn to a form we can use as the namespace specific part of the
			// attestation urn but can be decoded back to the nftId, as we need to maintain the
			// details of which connector created the NFT
			const attestationId = IotaAttestationUtils.nftIdToAttestationId(nftId);

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
	 * @returns The resolved attestation details.
	 */
	public async verify<T>(attestationId: string): Promise<{
		verified: boolean;
		failure?: string;
		information?: Partial<IAttestationInformation<T>>;
	}> {
		Urn.guard(this.CLASS_NAME, nameof(attestationId), attestationId);

		const urnParsed = Urn.fromValidString(attestationId);

		if (urnParsed.namespaceMethod() !== IotaAttestationConnector.NAMESPACE) {
			throw new GeneralError(this.CLASS_NAME, "namespaceMismatch", {
				namespace: IotaAttestationConnector.NAMESPACE,
				attestationId
			});
		}

		try {
			const nftId = IotaAttestationUtils.attestationIdToNftId(attestationId);

			const resolved = await this._nftConnector.resolve<
				IIotaAttestationPayload,
				IIotaAttestationHolder
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
				Is.object<IIotaAttestationHolder>(resolved.metadata) &&
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
	public async transfer<T>(
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

		if (urnParsed.namespaceMethod() !== IotaAttestationConnector.NAMESPACE) {
			throw new GeneralError(this.CLASS_NAME, "namespaceMismatch", {
				namespace: IotaAttestationConnector.NAMESPACE,
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

			const nftId = IotaAttestationUtils.attestationIdToNftId(attestationId);

			const holder: IIotaAttestationHolder = {
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

		if (urnParsed.namespaceMethod() !== IotaAttestationConnector.NAMESPACE) {
			throw new GeneralError(this.CLASS_NAME, "namespaceMismatch", {
				namespace: IotaAttestationConnector.NAMESPACE,
				attestationId
			});
		}

		try {
			const nftId = IotaAttestationUtils.attestationIdToNftId(attestationId);

			await this._nftConnector.burn(controller, nftId);
		} catch (error) {
			throw new GeneralError(this.CLASS_NAME, "destroyFailed", undefined, error);
		}
	}
}
