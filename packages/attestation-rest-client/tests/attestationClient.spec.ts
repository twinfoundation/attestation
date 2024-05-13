// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { AttestationClient } from "../src/attestationClient";

describe("AttestationClient", () => {
	test("Can create an instance", async () => {
		const client = new AttestationClient({ endpoint: "http://localhost:8080" });
		expect(client).toBeDefined();
	});
});
