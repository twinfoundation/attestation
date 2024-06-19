// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAttestationConnector, IAttestationInformation } from "@gtsc/attestation-models";
import { Coerce, GeneralError, Guards, Is, Urn } from "@gtsc/core";
import type { IIdentityConnector } from "@gtsc/identity-models";
import { nameof } from "@gtsc/nameof";
import type { INftConnector } from "@gtsc/nft-models";
import type { IRequestContext } from "@gtsc/services";
import type { IDidVerifiableCredential } from "@gtsc/standards-w3c-did";
import type { IVaultConnector } from "@gtsc/vault-models";
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
	public static readonly NAMESPACE: string = "iota-attestation";

	/**
	 * Runtime name for the class.
	 * @internal
	 */
	private static readonly _CLASS_NAME: string = nameof<IotaAttestationConnector>();

	/**
	 * Default tag.
	 * @internal
	 */
	private static readonly _DEFAULT_TAG: string = "GTSC-ATTESTATION";

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
	 * @param dependencies The dependencies for the class.
	 * @param dependencies.identityConnector The identity connector.
	 * @param dependencies.nftConnector The NFT connector.
	 * @param config The configuration for the connector.
	 */
	constructor(
		dependencies: {
			identityConnector: IIdentityConnector;
			nftConnector: INftConnector;
		},
		config?: IIotaAttestationConnectorConfig
	) {
		Guards.object(IotaAttestationConnector._CLASS_NAME, nameof(dependencies), dependencies);
		Guards.object<IVaultConnector>(
			IotaAttestationConnector._CLASS_NAME,
			nameof(dependencies.identityConnector),
			dependencies.identityConnector
		);
		Guards.object<IVaultConnector>(
			IotaAttestationConnector._CLASS_NAME,
			nameof(dependencies.nftConnector),
			dependencies.nftConnector
		);

		this._identityConnector = dependencies.identityConnector;
		this._nftConnector = dependencies.nftConnector;
		this._config = config ?? {};
		this._config.tag ??= IotaAttestationConnector._DEFAULT_TAG;
	}

	/**
	 * Attest the data and return the collated information.
	 * @param requestContext The context for the request.
	 * @param controllerAddress The controlling address for the attestation.
	 * @param verificationMethodId The identity verification method to use for attesting the data.
	 * @param data The data to attest.
	 * @returns The collated attestation data.
	 */
	public async attest<T>(
		requestContext: IRequestContext,
		controllerAddress: string,
		verificationMethodId: string,
		data: T
	): Promise<IAttestationInformation<T>> {
		Guards.object<IRequestContext>(
			IotaAttestationConnector._CLASS_NAME,
			nameof(requestContext),
			requestContext
		);
		Guards.stringValue(
			IotaAttestationConnector._CLASS_NAME,
			nameof(requestContext.tenantId),
			requestContext.tenantId
		);
		Guards.stringValue(
			IotaAttestationConnector._CLASS_NAME,
			nameof(requestContext.identity),
			requestContext.identity
		);
		Guards.stringValue(
			IotaAttestationConnector._CLASS_NAME,
			nameof(controllerAddress),
			controllerAddress
		);
		Guards.stringValue(
			IotaAttestationConnector._CLASS_NAME,
			nameof(verificationMethodId),
			verificationMethodId
		);
		Guards.object<T>(IotaAttestationConnector._CLASS_NAME, nameof(data), data);

		try {
			const verifiableCredential = await this._identityConnector.createVerifiableCredential(
				requestContext,
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
				requestContext,
				controllerAddress,
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
				data,
				proof: {
					type: "jwt",
					value: verifiableCredential.jwt
				}
			};

			return attestationInformation;
		} catch (error) {
			throw new GeneralError(
				IotaAttestationConnector._CLASS_NAME,
				"attestingFailed",
				undefined,
				error
			);
		}
	}

	/**
	 * Resolve and verify the attestation id.
	 * @param requestContext The context for the request.
	 * @param attestationId The attestation id to verify.
	 * @returns The resolved attestation details.
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
			IotaAttestationConnector._CLASS_NAME,
			nameof(requestContext),
			requestContext
		);
		Guards.stringValue(
			IotaAttestationConnector._CLASS_NAME,
			nameof(requestContext.tenantId),
			requestContext.tenantId
		);
		Guards.stringValue(
			IotaAttestationConnector._CLASS_NAME,
			nameof(requestContext.identity),
			requestContext.identity
		);
		Urn.guard(IotaAttestationConnector._CLASS_NAME, nameof(attestationId), attestationId);

		const urnParsed = Urn.fromValidString(attestationId);

		if (urnParsed.namespaceIdentifier() !== IotaAttestationConnector.NAMESPACE) {
			throw new GeneralError(IotaAttestationConnector._CLASS_NAME, "namespaceMismatch", {
				namespace: IotaAttestationConnector.NAMESPACE,
				attestationId
			});
		}

		try {
			const nftId = IotaAttestationUtils.attestationIdToNftId(attestationId);

			const resolved = await this._nftConnector.resolve<
				IIotaAttestationPayload,
				IIotaAttestationHolder
			>(requestContext, nftId);

			let failure: string | undefined;
			let checkResult:
				| {
						revoked: boolean;
						verifiableCredential?: IDidVerifiableCredential<T>;
				  }
				| undefined;

			const jwtProof = Coerce.string(resolved.immutableMetadata?.proof);
			if (Is.empty(jwtProof) || Is.empty(resolved.metadata)) {
				failure = `${IotaAttestationConnector._CLASS_NAME}.verificationFailures.noData`;
			} else {
				checkResult = await this._identityConnector.checkVerifiableCredential(
					requestContext,
					jwtProof
				);

				if (Is.empty(checkResult.verifiableCredential)) {
					failure = `${IotaAttestationConnector._CLASS_NAME}.verificationFailures.proofFailed`;
				} else if (checkResult.revoked) {
					failure = `${IotaAttestationConnector._CLASS_NAME}.verificationFailures.revoked`;
				}
			}

			const information: Partial<IAttestationInformation<T>> = {
				id: attestationId,
				created: checkResult?.verifiableCredential?.issuanceDate,
				ownerIdentity: checkResult?.verifiableCredential?.issuer,
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
			throw new GeneralError(
				IotaAttestationConnector._CLASS_NAME,
				"verificationFailed",
				undefined,
				error
			);
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
	public async transfer<T>(
		requestContext: IRequestContext,
		attestationId: string,
		holderControllerAddress: string,
		holderIdentity: string
	): Promise<IAttestationInformation<T>> {
		Guards.object<IRequestContext>(
			IotaAttestationConnector._CLASS_NAME,
			nameof(requestContext),
			requestContext
		);
		Guards.stringValue(
			IotaAttestationConnector._CLASS_NAME,
			nameof(requestContext.tenantId),
			requestContext.tenantId
		);
		Guards.stringValue(
			IotaAttestationConnector._CLASS_NAME,
			nameof(requestContext.identity),
			requestContext.identity
		);
		Urn.guard(IotaAttestationConnector._CLASS_NAME, nameof(attestationId), attestationId);
		Guards.stringValue(
			IotaAttestationConnector._CLASS_NAME,
			nameof(holderControllerAddress),
			holderControllerAddress
		);
		Guards.stringValue(
			IotaAttestationConnector._CLASS_NAME,
			nameof(holderIdentity),
			holderIdentity
		);

		const urnParsed = Urn.fromValidString(attestationId);

		if (urnParsed.namespaceIdentifier() !== IotaAttestationConnector.NAMESPACE) {
			throw new GeneralError(IotaAttestationConnector._CLASS_NAME, "namespaceMismatch", {
				namespace: IotaAttestationConnector.NAMESPACE,
				attestationId
			});
		}

		try {
			const verificationResult = await this.verify<T>(requestContext, attestationId);
			if (Is.stringValue(verificationResult.failure)) {
				throw new GeneralError(
					IotaAttestationConnector._CLASS_NAME,
					"verificationFailed",
					undefined,
					new GeneralError(IotaAttestationConnector._CLASS_NAME, verificationResult.failure)
				);
			}

			const nftId = IotaAttestationUtils.attestationIdToNftId(attestationId);

			const holder: IIotaAttestationHolder = {
				transferred: new Date().toISOString(),
				holderIdentity
			};

			await this._nftConnector.transfer(requestContext, nftId, holderControllerAddress, holder);

			return {
				...(verificationResult.information as IAttestationInformation<T>),
				...holder
			};
		} catch (error) {
			throw new GeneralError(
				IotaAttestationConnector._CLASS_NAME,
				"transferFailed",
				undefined,
				error
			);
		}
	}
}
