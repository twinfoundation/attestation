// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter, Urn } from "@gtsc/core";
import { EntityStorageAttestationConnector } from "./entityStorageAttestationConnector";

/**
 * Utility functions for the entity storage attestation.
 */
export class EntityStorageAttestationUtils {
	/**
	 * Convert an attestation id to an nft id.
	 * @param attestationId The attestation id to convert.
	 * @returns The address.
	 */
	public static attestationIdToNftId(attestationId: string): string {
		const attestationUrn = Urn.fromValidString(attestationId);
		const nftId = Urn.fromValidString(
			Converter.bytesToUtf8(Converter.base64ToBytes(attestationUrn.namespaceSpecific(1)))
		);
		return nftId.toString();
	}

	/**
	 * Convert an nft id to an attestation id.
	 * @param nftId The nft id to convert.
	 * @returns The attestation id.
	 */
	public static nftIdToAttestationId(nftId: string): string {
		const nftUrn = Urn.fromValidString(nftId);
		const namespaceSpecific = Converter.bytesToBase64(Converter.utf8ToBytes(nftUrn.toString(true)));
		const attestationId = new Urn(EntityStorageAttestationConnector.NAMESPACE, namespaceSpecific);
		return `attestation:${attestationId.toString()}`;
	}
}
