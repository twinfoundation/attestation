// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { EntityStorageAttestationConnector } from "../src/entityStorageAttestationConnector";

describe("EntityStorageAttestationConnector", () => {
	test("can construct", async () => {
		const attestation = new EntityStorageAttestationConnector();
		expect(attestation).toBeDefined();
	});
});
