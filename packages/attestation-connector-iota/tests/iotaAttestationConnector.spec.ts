// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { Converter, Is, Urn } from "@gtsc/core";
import { IotaIdentityUtils } from "@gtsc/identity-connector-iota";
import { IotaNftUtils } from "@gtsc/nft-connector-iota";
import {
	TEST_CONTEXT,
	TEST_IDENTITY_ADDRESS_BECH32,
	TEST_IDENTITY_ADDRESS_BECH32_2,
	TEST_IDENTITY_CONNECTOR,
	setupTestEnv
} from "./setupTestEnv";
import { IotaAttestationConnector } from "../src/iotaAttestationConnector";

let ownerIdentity: string;
let verificationMethodId: string;
let attestationId: string;

describe("IotaAttestationConnector", () => {
	beforeAll(async () => {
		await setupTestEnv();

		const testIdentity = await TEST_IDENTITY_CONNECTOR.createDocument(
			TEST_IDENTITY_ADDRESS_BECH32,
			TEST_CONTEXT
		);
		ownerIdentity = testIdentity.id;
		console.debug(
			"DID Document",
			`${process.env.TEST_EXPLORER_URL}addr/${IotaIdentityUtils.didToAddress(testIdentity.id)}?tab=DID`
		);

		const verificationMethod = await TEST_IDENTITY_CONNECTOR.addVerificationMethod(
			testIdentity.id,
			"assertionMethod",
			"attestation",
			TEST_CONTEXT
		);
		verificationMethodId = verificationMethod.id;
	});

	test("can construct", async () => {
		const attestation = new IotaAttestationConnector();
		expect(attestation).toBeDefined();
	});

	test("can attest some data", async () => {
		const attestation = new IotaAttestationConnector();

		const dataPayload = {
			docName: "bill-of-lading",
			mimeType: "application/pdf",
			fingerprint: "0xf0b95a98b3dbc5ce1c9ce59d70af95a97599f100a7296ecdd1eb108bebfa047f"
		};

		const attested = await attestation.attest(
			TEST_IDENTITY_ADDRESS_BECH32,
			verificationMethodId,
			dataPayload,
			TEST_CONTEXT
		);

		expect(attested).toBeDefined();
		expect(attested.id.startsWith("urn:iota-attestation")).toEqual(true);
		expect(Is.dateTimeString(attested.created)).toEqual(true);
		expect(attested.ownerIdentity).toEqual(ownerIdentity);
		expect(attested.holderIdentity).toEqual(ownerIdentity);
		expect(attested.transferred).toEqual(undefined);
		expect(attested.data).toEqual(dataPayload);
		expect(attested.proof?.type).toEqual("jwt");
		expect(attested.proof?.value.split(".").length).toEqual(3);

		const idUrn = Urn.fromValidString(attested.id);
		const nftId = Converter.bytesToUtf8(Converter.base64ToBytes(idUrn.namespaceSpecific()));
		const nftAddress = IotaNftUtils.nftIdToAddress(nftId);
		console.debug("Attestation NFT", `${process.env.TEST_EXPLORER_URL}addr/${nftAddress}`);

		attestationId = attested.id;
	});

	test("can verify an attestation", async () => {
		const attestation = new IotaAttestationConnector();

		const attested = await attestation.verify(attestationId, TEST_CONTEXT);

		expect(attested).toBeDefined();
		expect(attested.verified).toEqual(true);
		expect(attested.failure).toEqual(undefined);
		expect(attested.information?.id?.startsWith("urn:iota-attestation")).toEqual(true);
		expect(Is.dateTimeString(attested.information?.created)).toEqual(true);
		expect(attested.information?.ownerIdentity).toEqual(ownerIdentity);
		expect(attested.information?.holderIdentity).toEqual(ownerIdentity);
		expect(attested.information?.transferred).toEqual(undefined);
		expect(attested.information?.data).toEqual({
			docName: "bill-of-lading",
			mimeType: "application/pdf",
			fingerprint: "0xf0b95a98b3dbc5ce1c9ce59d70af95a97599f100a7296ecdd1eb108bebfa047f"
		});
		expect(attested.information?.proof?.type).toEqual("jwt");
		expect(attested.information?.proof?.value.split(".").length).toEqual(3);
	});

	test("can transfer an attestation", async () => {
		const attestation = new IotaAttestationConnector();

		const testIdentity2 = await TEST_IDENTITY_CONNECTOR.createDocument(
			TEST_IDENTITY_ADDRESS_BECH32_2,
			TEST_CONTEXT
		);

		const transfered = await attestation.transfer(
			attestationId,
			TEST_IDENTITY_ADDRESS_BECH32_2,
			testIdentity2.id,
			TEST_CONTEXT
		);

		expect(transfered).toBeDefined();
		expect(transfered.id.startsWith("urn:iota-attestation")).toEqual(true);
		expect(Is.dateTimeString(transfered.created)).toEqual(true);
		expect(transfered.ownerIdentity).toEqual(ownerIdentity);
		expect(transfered.holderIdentity).toEqual(testIdentity2.id);
		expect(Is.dateTimeString(transfered.transferred)).toEqual(true);
		expect(transfered.data).toEqual({
			docName: "bill-of-lading",
			mimeType: "application/pdf",
			fingerprint: "0xf0b95a98b3dbc5ce1c9ce59d70af95a97599f100a7296ecdd1eb108bebfa047f"
		});
		expect(transfered.proof?.type).toEqual("jwt");
		expect(transfered.proof?.value.split(".").length).toEqual(3);
	});
});
