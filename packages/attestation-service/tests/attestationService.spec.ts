// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { NftAttestationConnector } from "@twin.org/attestation-connector-nft";
import { AttestationConnectorFactory } from "@twin.org/attestation-models";
import { type IWalletConnector, WalletConnectorFactory } from "@twin.org/wallet-models";
import { AttestationService } from "../src/attestationService";

describe("AttestationService", () => {
	test("Can create an instance", async () => {
		AttestationConnectorFactory.register(
			NftAttestationConnector.NAMESPACE,
			() => new NftAttestationConnector()
		);
		WalletConnectorFactory.register("wallet", () => ({}) as IWalletConnector);
		const service = new AttestationService({ walletConnectorType: "wallet" });
		expect(service).toBeDefined();
	});
});
