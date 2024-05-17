// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { EntityStorageAttestationConnector } from "@gtsc/attestation-connector-entity-storage";
import { AttestationConnectorFactory } from "@gtsc/attestation-models";
import { MemoryBlobStorageConnector } from "@gtsc/blob-storage-connector-memory";
import { AttestationService } from "../src/attestationService";

describe("AttestationService", () => {
	test("Can create an instance", async () => {
		AttestationConnectorFactory.register(
			EntityStorageAttestationConnector.NAMESPACE,
			() => new EntityStorageAttestationConnector({ a: "kkk" })
		);
		const service = new AttestationService({
			blobStorageConnection: new MemoryBlobStorageConnector()
		});
		expect(service).toBeDefined();
	});
});
