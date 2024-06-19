// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter, Urn } from "@gtsc/core";
import { IotaAttestationConnector } from "./iotaAttestationConnector";

/**
 * Utility functions for the iota attestation.
 */
export class IotaAttestationUtils {
	/**
	 * Convert an attestation id to an nft id.
	 * @param attestationId The attestation id to convert.
	 * @returns The address.
	 */
	public static attestationIdToNftId(attestationId: string): string {
		const attestationUrn = Urn.fromValidString(attestationId);
		const nftId = Urn.fromValidString(
			Converter.bytesToUtf8(Converter.base64ToBytes(attestationUrn.namespaceSpecific()))
		);
		return nftId.toString(false);
	}

	/**
	 * Convert an nft id to an attestation id.
	 * @param nftId The nft id to convert.
	 * @returns The attestation id.
	 */
	public static nftIdToAttestationId(nftId: string): string {
		const nftUrn = Urn.fromValidString(nftId);
		const namespaceSpecific = Converter.bytesToBase64(Converter.utf8ToBytes(nftUrn.toString(true)));
		const attestationId = new Urn(IotaAttestationConnector.NAMESPACE, namespaceSpecific);
		return attestationId.toString(false);
	}
}
