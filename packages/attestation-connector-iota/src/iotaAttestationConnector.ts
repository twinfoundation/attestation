// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	AttestationTypes,
	type IAttestationConnector,
	type IAttestationInformation
} from "@twin.org/attestation-models";
import {
	Coerce,
	GeneralError,
	Guards,
	Is,
	Urn,
	Validation,
	type IValidationFailure
} from "@twin.org/core";
import { JsonLdHelper, JsonLdProcessor, type IJsonLdNodeObject } from "@twin.org/data-json-ld";
import { SchemaOrgDataTypes, SchemaOrgTypes } from "@twin.org/data-schema-org";
import { IdentityConnectorFactory, type IIdentityConnector } from "@twin.org/identity-models";
import { nameof } from "@twin.org/nameof";
import { NftConnectorFactory, type INftConnector } from "@twin.org/nft-models";
import { DidContexts, DidTypes, type IDidVerifiableCredential } from "@twin.org/standards-w3c-did";
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
	private static readonly _DEFAULT_TAG: string = "TWIN-ATTESTATION";

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

		SchemaOrgDataTypes.registerRedirects();
	}

	/**
	 * Attest the data and return the collated information.
	 * @param controller The controller identity of the user to access the vault keys.
	 * @param address The controlling address for the attestation.
	 * @param verificationMethodId The identity verification method to use for attesting the data.
	 * @param attestationObject The data to attest.
	 * @returns The id.
	 */
	public async create(
		controller: string,
		address: string,
		verificationMethodId: string,
		attestationObject: IJsonLdNodeObject
	): Promise<string> {
		Guards.stringValue(this.CLASS_NAME, nameof(controller), controller);
		Guards.stringValue(this.CLASS_NAME, nameof(address), address);
		Guards.stringValue(this.CLASS_NAME, nameof(verificationMethodId), verificationMethodId);
		Guards.object<IJsonLdNodeObject>(this.CLASS_NAME, nameof(attestationObject), attestationObject);

		try {
			const validationFailures: IValidationFailure[] = [];
			await JsonLdHelper.validate(attestationObject, validationFailures);
			Validation.asValidationError(this.CLASS_NAME, "data", validationFailures);

			const verifiableCredential = await this._identityConnector.createVerifiableCredential(
				controller,
				verificationMethodId,
				undefined,
				attestationObject
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
			return IotaAttestationUtils.nftIdToAttestationId(nftId);
		} catch (error) {
			throw new GeneralError(this.CLASS_NAME, "attestingFailed", undefined, error);
		}
	}

	/**
	 * Resolve and verify the attestation id.
	 * @param id The attestation id to verify.
	 * @returns The resolved attestation details.
	 */
	public async get(id: string): Promise<IAttestationInformation> {
		Urn.guard(this.CLASS_NAME, nameof(id), id);

		const urnParsed = Urn.fromValidString(id);

		if (urnParsed.namespaceMethod() !== IotaAttestationConnector.NAMESPACE) {
			throw new GeneralError(this.CLASS_NAME, "namespaceMismatch", {
				namespace: IotaAttestationConnector.NAMESPACE,
				attestationId: id
			});
		}

		try {
			const nftId = IotaAttestationUtils.attestationIdToNftId(id);

			const resolved = await this._nftConnector.resolve<
				IIotaAttestationPayload,
				IIotaAttestationHolder
			>(nftId);

			let failure: string | undefined;
			let checkResult:
				| {
						revoked: boolean;
						verifiableCredential?: IDidVerifiableCredential;
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

			const jsonObject = Is.array(checkResult?.verifiableCredential?.credentialSubject)
				? checkResult.verifiableCredential.credentialSubject[0]
				: checkResult?.verifiableCredential?.credentialSubject;
			let contextAndType: IJsonLdNodeObject | undefined;

			if (Is.object<IJsonLdNodeObject>(jsonObject)) {
				contextAndType = {};

				const context = JsonLdProcessor.removeContexts(
					checkResult?.verifiableCredential?.["@context"],
					Object.values(DidContexts)
				);

				if (!Is.empty(context)) {
					contextAndType["@context"] = context;
				}

				const remainingTypes = checkResult?.verifiableCredential?.type?.filter(
					t => t !== DidTypes.VerifiableCredential
				);
				if (Is.arrayValue(remainingTypes)) {
					contextAndType.type = remainingTypes[0];
				}
			}

			const information: IAttestationInformation = {
				"@context": [AttestationTypes.ContextRoot, SchemaOrgTypes.ContextRoot],
				type: AttestationTypes.Information,
				id,
				dateCreated: checkResult?.verifiableCredential?.issuanceDate ?? "",
				ownerIdentity: checkResult?.verifiableCredential?.issuer ?? "",
				holderIdentity: checkResult?.verifiableCredential?.issuer,
				attestationObject: {
					...contextAndType,
					...jsonObject
				}
			};

			if (Is.stringValue(jwtProof)) {
				information.proof = {
					"@context": AttestationTypes.ContextRoot,
					type: AttestationTypes.JwtProof,
					value: jwtProof
				};
			}

			if (
				Is.object<IIotaAttestationHolder>(resolved.metadata) &&
				Is.stringValue(resolved.metadata.holderIdentity) &&
				Is.stringValue(resolved.metadata.dateTransferred)
			) {
				information.holderIdentity = resolved.metadata.holderIdentity;
				information.dateTransferred = resolved.metadata.dateTransferred;
			}

			information.verified = Is.empty(failure);
			information.verificationFailure = failure;

			const compacted = await JsonLdProcessor.compact(information, information["@context"]);

			return compacted as IAttestationInformation;
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
	 * @returns Nothing.
	 */
	public async transfer(
		controller: string,
		attestationId: string,
		holderIdentity: string,
		holderAddress: string
	): Promise<void> {
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
			const verificationResult = await this.get(attestationId);
			if (Is.stringValue(verificationResult.verificationFailure)) {
				throw new GeneralError(
					this.CLASS_NAME,
					"verificationFailed",
					undefined,
					new GeneralError(this.CLASS_NAME, verificationResult.verificationFailure)
				);
			}

			const nftId = IotaAttestationUtils.attestationIdToNftId(attestationId);

			const holder: IIotaAttestationHolder = {
				dateTransferred: new Date().toISOString(),
				holderIdentity
			};

			await this._nftConnector.transfer(controller, nftId, holderAddress, holder);
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
