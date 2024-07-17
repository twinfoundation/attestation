// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IRestRouteEntryPoint } from "@gtsc/api-models";
import { generateRestRoutesAttestation, tagsAttestation } from "./attestationRoutes";

export const restEntryPoints: IRestRouteEntryPoint[] = [
	{
		name: "attestation",
		tags: tagsAttestation,
		generateRoutes: generateRestRoutesAttestation
	}
];
