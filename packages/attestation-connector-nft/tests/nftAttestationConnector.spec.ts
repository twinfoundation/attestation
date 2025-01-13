// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Is } from "@twin.org/core";
import type { IJsonLdNodeObject } from "@twin.org/data-json-ld";
import {
	TEST_IDENTITY_ADDRESS_BECH32,
	TEST_IDENTITY_ADDRESS_BECH32_2,
	TEST_IDENTITY_CONNECTOR,
	TEST_IDENTITY_ID,
	setupTestEnv
} from "./setupTestEnv";
import { NftAttestationConnector } from "../src/nftAttestationConnector";

let ownerIdentity: string;
let verificationMethodId: string;
let attestationId: string;

describe("NftAttestationConnector", () => {
	beforeAll(async () => {
		await setupTestEnv();

		const testIdentity = await TEST_IDENTITY_CONNECTOR.createDocument(TEST_IDENTITY_ID);
		ownerIdentity = testIdentity.id;

		const verificationMethod = await TEST_IDENTITY_CONNECTOR.addVerificationMethod(
			TEST_IDENTITY_ID,
			testIdentity.id,
			"assertionMethod",
			"attestation"
		);
		verificationMethodId = verificationMethod.id;
	});

	test("can construct", async () => {
		const attestation = new NftAttestationConnector();
		expect(attestation).toBeDefined();
	});

	test("can attest some data", async () => {
		const attestation = new NftAttestationConnector();

		const dataPayload: IJsonLdNodeObject = {
			"@context": "https://schema.org/",
			type: "DigitalDocument",
			id: "did:test:1234567890abcdef",
			name: "My Document"
		};

		const attestedId = await attestation.create(
			TEST_IDENTITY_ID,
			TEST_IDENTITY_ADDRESS_BECH32,
			verificationMethodId,
			dataPayload
		);

		expect(attestedId).toBeDefined();
		expect(attestedId.startsWith("attestation:nft")).toEqual(true);

		attestationId = attestedId;
	});

	test("can get an attestation", async () => {
		const attestation = new NftAttestationConnector();

		try {
			await attestation.get(attestationId);
		} catch (error) {
			console.log(error);
		}
		const attested = await attestation.get(attestationId);

		expect(attested).toBeDefined();
		expect(attested.verified).toEqual(true);
		expect(attested.verificationFailure).toEqual(undefined);
		expect(attested.id?.startsWith("attestation:nft")).toEqual(true);
		expect(Is.dateTimeString(attested?.dateCreated)).toEqual(true);
		expect(attested.ownerIdentity).toEqual(ownerIdentity);
		expect(attested.holderIdentity).toEqual(ownerIdentity);
		expect(attested.dateTransferred).toEqual(undefined);
		expect(attested.attestationObject).toEqual({
			"@context": "https://schema.org/",
			type: "DigitalDocument",
			id: "did:test:1234567890abcdef",
			name: "My Document"
		});
		expect(attested.proof?.type).toEqual("JwtProof");
		expect((attested.proof?.value as string).split(".").length).toEqual(3);
	});

	test("can transfer an attestation", async () => {
		const attestation = new NftAttestationConnector();

		const testIdentity2 = await TEST_IDENTITY_CONNECTOR.createDocument(TEST_IDENTITY_ID);

		await attestation.transfer(
			TEST_IDENTITY_ID,
			attestationId,
			testIdentity2.id,
			TEST_IDENTITY_ADDRESS_BECH32_2
		);

		const transfered = await attestation.get(attestationId);

		expect(transfered).toBeDefined();
		expect(transfered.id.startsWith("attestation:nft")).toEqual(true);
		expect(Is.dateTimeString(transfered.dateCreated)).toEqual(true);
		expect(transfered.ownerIdentity).toEqual(ownerIdentity);
		expect(transfered.holderIdentity).toEqual(testIdentity2.id);
		expect(Is.dateTimeString(transfered.dateTransferred)).toEqual(true);
		expect(transfered.attestationObject).toEqual({
			"@context": "https://schema.org/",
			type: "DigitalDocument",
			id: "did:test:1234567890abcdef",
			name: "My Document"
		});
		expect(transfered.proof?.type).toEqual("JwtProof");
		expect((transfered.proof?.value as string).split(".").length).toEqual(3);
	});
});
