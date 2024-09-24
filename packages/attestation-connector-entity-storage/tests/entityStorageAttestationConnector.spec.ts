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
import { EntityStorageAttestationConnector } from "../src/entityStorageAttestationConnector";

let ownerIdentity: string;
let verificationMethodId: string;
let attestationId: string;

describe("EntityStorageAttestationConnector", () => {
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
		const attestation = new EntityStorageAttestationConnector();
		expect(attestation).toBeDefined();
	});

	test("can attest some data", async () => {
		const attestation = new EntityStorageAttestationConnector();

		const dataPayload: IJsonLdNodeObject = {
			"@context": "http://schema.org/",
			type: "DigitalDocument",
			id: "did:test:1234567890abcdef",
			name: "My Document"
		};

		const attested = await attestation.attest(
			TEST_IDENTITY_ID,
			TEST_IDENTITY_ADDRESS_BECH32,
			verificationMethodId,
			dataPayload
		);

		expect(attested).toBeDefined();
		expect(attested.id.startsWith("attestation:entity-storage")).toEqual(true);
		expect(Is.dateTimeString(attested?.created)).toEqual(true);
		expect(attested.ownerIdentity).toEqual(ownerIdentity);
		expect(attested.holderIdentity).toEqual(ownerIdentity);
		expect(attested.transferred).toEqual(undefined);
		expect(attested.data).toEqual(dataPayload);
		expect(attested.proof?.type).toEqual("jwt");
		expect(attested.proof?.value.split(".").length).toEqual(3);

		attestationId = attested?.id;
	});

	test("can verify an attestation", async () => {
		const attestation = new EntityStorageAttestationConnector();

		const attested = await attestation.verify(attestationId);

		expect(attested).toBeDefined();
		expect(attested.verified).toEqual(true);
		expect(attested.failure).toEqual(undefined);
		expect(attested.information?.id?.startsWith("attestation:entity-storage")).toEqual(true);
		expect(Is.dateTimeString(attested.information?.created)).toEqual(true);
		expect(attested.information?.ownerIdentity).toEqual(ownerIdentity);
		expect(attested.information?.holderIdentity).toEqual(ownerIdentity);
		expect(attested.information?.transferred).toEqual(undefined);
		expect(attested.information?.data).toEqual({
			"@context": "http://schema.org/",
			type: "DigitalDocument",
			id: "did:test:1234567890abcdef",
			name: "My Document"
		});
		expect(attested.information?.proof?.type).toEqual("jwt");
		expect(attested.information?.proof?.value.split(".").length).toEqual(3);
	});

	test("can transfer an attestation", async () => {
		const attestation = new EntityStorageAttestationConnector();

		const testIdentity2 = await TEST_IDENTITY_CONNECTOR.createDocument(TEST_IDENTITY_ID);

		const transfered = await attestation.transfer(
			TEST_IDENTITY_ID,
			attestationId,
			testIdentity2.id,
			TEST_IDENTITY_ADDRESS_BECH32_2
		);

		expect(transfered).toBeDefined();
		expect(transfered.id.startsWith("attestation:entity-storage")).toEqual(true);
		expect(Is.dateTimeString(transfered.created)).toEqual(true);
		expect(transfered.ownerIdentity).toEqual(ownerIdentity);
		expect(transfered.holderIdentity).toEqual(testIdentity2.id);
		expect(Is.dateTimeString(transfered.transferred)).toEqual(true);
		expect(transfered.data).toEqual({
			"@context": "http://schema.org/",
			type: "DigitalDocument",
			id: "did:test:1234567890abcdef",
			name: "My Document"
		});
		expect(transfered.proof?.type).toEqual("jwt");
		expect(transfered.proof?.value.split(".").length).toEqual(3);
	});
});
