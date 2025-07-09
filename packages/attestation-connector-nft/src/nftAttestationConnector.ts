// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import {
	AttestationContexts,
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
import { IdentityConnectorFactory, type IIdentityConnector } from "@twin.org/identity-models";
import { nameof } from "@twin.org/nameof";
import { NftConnectorFactory, type INftConnector } from "@twin.org/nft-models";
import { SchemaOrgContexts, SchemaOrgDataTypes } from "@twin.org/standards-schema-org";
import { DidContexts, DidTypes, type IDidVerifiableCredential } from "@twin.org/standards-w3c-did";
import type { INftAttestationConnectorConfig } from "./models/INftAttestationConnectorConfig";
import type { INftAttestationConnectorConstructorOptions } from "./models/INftAttestationConnectorConstructorOptions";
import type { INftAttestationHolder } from "./models/INftAttestationHolder";
import type { INftAttestationPayload } from "./models/INftAttestationPayload";
import { NftAttestationUtils } from "./nftAttestationUtils";

/**
 * Class for performing attestation operations in nfts.
 */
export class NftAttestationConnector implements IAttestationConnector {
	/**
	 * The namespace for the entities.
	 */
	public static readonly NAMESPACE: string = "nft";

	/**
	 * Default tag.
	 * @internal
	 */
	private static readonly _DEFAULT_TAG: string = "TWIN-ATTESTATION";

	/**
	 * Runtime name for the class.
	 */
	public readonly CLASS_NAME: string = nameof<NftAttestationConnector>();

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
	private readonly _config: INftAttestationConnectorConfig;

	/**
	 * Create a new instance of NftAttestationConnector.
	 * @param options The options for the attestation connector.
	 */
	constructor(options?: INftAttestationConnectorConstructorOptions) {
		this._identityConnector = IdentityConnectorFactory.get(
			options?.identityConnectorType ?? "identity"
		);
		this._nftConnector = NftConnectorFactory.get(options?.nftConnectorType ?? "nft");
		this._config = options?.config ?? {};
		this._config.tag ??= NftAttestationConnector._DEFAULT_TAG;

		SchemaOrgDataTypes.registerRedirects();
	}

	/**
	 * Attest the data and return the collated information.
	 * @param controller The controller identity of the user to access the vault keys.
	 * @param verificationMethodId The identity verification method to use for attesting the data.
	 * @param attestationObject The data to attest.
	 * @returns The id of the attestation.
	 */
	public async create(
		controller: string,
		verificationMethodId: string,
		attestationObject: IJsonLdNodeObject
	): Promise<string> {
		Guards.stringValue(this.CLASS_NAME, nameof(controller), controller);
		Guards.stringValue(this.CLASS_NAME, nameof(verificationMethodId), verificationMethodId);
		Guards.object<IJsonLdNodeObject>(this.CLASS_NAME, nameof(attestationObject), attestationObject);

		try {
			const validationFailures: IValidationFailure[] = [];
			await JsonLdHelper.validate(attestationObject, validationFailures);
			Validation.asValidationError(this.CLASS_NAME, nameof(attestationObject), validationFailures);

			const verifiableCredential = await this._identityConnector.createVerifiableCredential(
				controller,
				verificationMethodId,
				undefined,
				attestationObject
			);

			const attestationPayload: INftAttestationPayload = {
				version: "1",
				proof: verifiableCredential.jwt
			};

			const holder: INftAttestationHolder = {};

			const nftId = await this._nftConnector.mint(
				controller,
				this._config.tag ?? NftAttestationConnector._DEFAULT_TAG,
				attestationPayload,
				holder
			);

			// Convert the nftId urn to a form we can use as the namespace specific part of the
			// attestation urn but can be decoded back to the nftId, as we need to maintain the
			// details of which connector created the NFT
			return NftAttestationUtils.nftIdToAttestationId(nftId);
		} catch (error) {
			throw new GeneralError(this.CLASS_NAME, "attestingFailed", undefined, error);
		}
	}

	/**
	 * Resolve and verify the attestation id.
	 * @param id The attestation id to verify.
	 * @returns The verified attestation details.
	 */
	public async get(id: string): Promise<IAttestationInformation> {
		Urn.guard(this.CLASS_NAME, nameof(id), id);

		const urnParsed = Urn.fromValidString(id);

		if (urnParsed.namespaceMethod() !== NftAttestationConnector.NAMESPACE) {
			throw new GeneralError(this.CLASS_NAME, "namespaceMismatch", {
				namespace: NftAttestationConnector.NAMESPACE,
				attestationId: id
			});
		}

		try {
			const nftId = NftAttestationUtils.attestationIdToNftId(id);

			const resolved = await this._nftConnector.resolve<
				INftAttestationPayload,
				INftAttestationHolder
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

				const types = Is.array(checkResult?.verifiableCredential?.type)
					? checkResult.verifiableCredential.type
					: [checkResult?.verifiableCredential?.type];
				const remainingTypes = types?.filter(t => t !== DidTypes.VerifiableCredential);
				if (Is.arrayValue(remainingTypes)) {
					contextAndType.type = remainingTypes[0];
				}
			}

			let owner = "";
			const issuer = checkResult?.verifiableCredential?.issuer;
			if (Is.string(issuer)) {
				owner = issuer;
			} else if (Is.object(issuer)) {
				owner = issuer.id;
			}

			const information: IAttestationInformation = {
				"@context": [
					AttestationContexts.ContextRoot,
					AttestationContexts.ContextRootCommon,
					SchemaOrgContexts.ContextRoot
				],
				type: AttestationTypes.Information,
				id,
				dateCreated: checkResult?.verifiableCredential?.issuanceDate ?? "",
				ownerIdentity: owner,
				holderIdentity: owner,
				attestationObject: {
					...contextAndType,
					...jsonObject
				}
			};

			if (Is.object(contextAndType)) {
				information["@context"] = JsonLdProcessor.combineContexts(
					information["@context"],
					contextAndType["@context"]
				) as IAttestationInformation["@context"];
			}

			if (Is.stringValue(jwtProof)) {
				information.proof = {
					"@context": AttestationContexts.ContextRoot,
					type: AttestationTypes.JwtProof,
					value: jwtProof
				};
				information["@context"] = JsonLdProcessor.combineContexts(
					information["@context"],
					information.proof["@context"]
				) as IAttestationInformation["@context"];
			}

			if (
				Is.object<INftAttestationHolder>(resolved.metadata) &&
				Is.stringValue(resolved.metadata.dateTransferred)
			) {
				information.holderIdentity = resolved.owner;
				information.dateTransferred = resolved.metadata.dateTransferred;
			}

			information.verified = Is.empty(failure);
			information.verificationFailure = failure;

			return JsonLdProcessor.compact(information, information["@context"]);
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

		if (urnParsed.namespaceMethod() !== NftAttestationConnector.NAMESPACE) {
			throw new GeneralError(this.CLASS_NAME, "namespaceMismatch", {
				namespace: NftAttestationConnector.NAMESPACE,
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

			const nftId = NftAttestationUtils.attestationIdToNftId(attestationId);

			const holder: INftAttestationHolder = {
				dateTransferred: new Date().toISOString()
			};

			await this._nftConnector.transfer(controller, nftId, holderIdentity, holderAddress, holder);
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

		if (urnParsed.namespaceMethod() !== NftAttestationConnector.NAMESPACE) {
			throw new GeneralError(this.CLASS_NAME, "namespaceMismatch", {
				namespace: NftAttestationConnector.NAMESPACE,
				attestationId
			});
		}

		try {
			const nftId = NftAttestationUtils.attestationIdToNftId(attestationId);

			await this._nftConnector.burn(controller, nftId);
		} catch (error) {
			throw new GeneralError(this.CLASS_NAME, "destroyFailed", undefined, error);
		}
	}
}
