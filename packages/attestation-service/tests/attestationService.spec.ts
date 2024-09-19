// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { EntityStorageAttestationConnector } from "@twin.org/attestation-connector-entity-storage";
import { AttestationConnectorFactory } from "@twin.org/attestation-models";
import { type IWalletConnector, WalletConnectorFactory } from "@twin.org/wallet-models";
import { AttestationService } from "../src/attestationService";

describe("AttestationService", () => {
	test("Can create an instance", async () => {
		AttestationConnectorFactory.register(
			EntityStorageAttestationConnector.NAMESPACE,
			() => new EntityStorageAttestationConnector()
		);
		WalletConnectorFactory.register("wallet", () => ({}) as IWalletConnector);
		const service = new AttestationService({ walletConnectorType: "wallet" });
		expect(service).toBeDefined();
	});
});
