// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IAttestationConnector } from "@gtsc/attestation-models";
import { AttestationService } from "../src/attestationService";

describe("AttestationService", () => {
	test("Can create an instance", async () => {
		const service = new AttestationService({
			attestationConnector: {} as unknown as IAttestationConnector
		});
		expect(service).toBeDefined();
	});
});
