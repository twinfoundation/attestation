// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { OpenAttestationConnector } from "../src/openAttestationConnector";

describe("OpenAttestationConnector", () => {
	test("can construct", async () => {
		const attestation = new OpenAttestationConnector({});
		expect(attestation).toBeDefined();
	});
});
