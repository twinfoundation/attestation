// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { EntityStorageAttestationConnector } from "@gtsc/attestation-connector-entity-storage";
import { AttestationConnectorFactory } from "@gtsc/attestation-models";
import { AttestationService } from "../src/attestationService";

describe("AttestationService", () => {
	test("Can create an instance", async () => {
		AttestationConnectorFactory.register(
			EntityStorageAttestationConnector.NAMESPACE,
			() => new EntityStorageAttestationConnector()
		);
		const service = new AttestationService();
		expect(service).toBeDefined();
	});
});
