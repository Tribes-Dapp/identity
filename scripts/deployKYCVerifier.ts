import { ethers } from 'hardhat';
import { packValidatorParams } from '../utils/pack-utils';
import { calculateQueryHash } from '../utils/utils';

const Operators = {
  NOOP: 0, // No operation, skip query verification in circuit
  EQ: 1, // equal
  LT: 2, // less than
  GT: 3, // greater than
  IN: 4, // in
  NIN: 5, // not in
  NE: 6 // not equal
};

async function main() {

  // Use the Docker image contained on Dockerfile to create the circuit params
  // actualize
  const schema = '16101950847985442080272132781090291727';
  const schemaClaimPathKey =
    '10578028729432718103059124701305124538124973667277556573095537376700969315500';

  //

  const schemaUrl =
    'https://raw.githubusercontent.com/Tribes-Dapp/identity/main/utils/schema/KYC_Tribes_Creator/KYC_Tribes_Creator.jsonld';
  const type = 'tribesIdentityCreator';
  const value = [18, ...new Array(63).fill(0)];
  const slotIndex = 0;

  const dapp = "0x59b22D57D4f067708AB0c00552767405926dc768" // Change this to your DApp address
  const inputBox = "0x59b22D57D4f067708AB0c00552767405926dc768"

  const contractName = 'KYCTribes';
  const VerifierContractFactory = await ethers.getContractFactory(contractName);
  const verifierInstace = await VerifierContractFactory.deploy(dapp, inputBox);
  const claimPathDoesntExist = 0;

  await verifierInstace.deployed();
  console.log(contractName, 'deployed to:', verifierInstace.address);

  // Below is the code to setZKPRequest request metadata

  const circuitIdSig = 'credentialAtomicQuerySigV2OnChain';
  const validatorAddressSig = '0x1E4a22540E293C0e5E8c33DAfd6f523889cFd878';
  const chainId = 80001;
  const network = 'polygon-mumbai';
  const query = {
    schema: schema,
    claimPathKey: schemaClaimPathKey,
    operator: Operators.GT,
    slotIndex: slotIndex,
    value: value,
    queryHash: calculateQueryHash(
      value,
      schema,
      slotIndex,
      Operators.GT,
      schemaClaimPathKey,
      claimPathDoesntExist
    ).toString(),
    circuitIds: [circuitIdSig],
    allowedIssuers: [],
    skipClaimRevocationCheck: false,
    claimPathNotExists: claimPathDoesntExist
  };

  const requestIdSig = await verifierInstace.KYC_TRIBES_ID_SIG_VALIDATOR();

  const invokeRequestMetadata = {
    id: 'db2fbba5-98e0-47fb-8022-29da9b29d2ac',
    typ: 'application/iden3comm-plain-json',
    type: 'https://iden3-communication.io/proofs/1.0/contract-invoke-request',
    thid: 'db2fbba5-98e0-47fb-8022-29da9b29d2ac',
    body: {
      reason: 'for testing',
      transaction_data: {
        contract_address: verifierInstace.address,
        method_id: 'b68967e2',
        chain_id: chainId,
        network: network
      },
      scope: [
        {
          id: requestIdSig,
          circuitId: circuitIdSig,
          query: {
            allowedIssuers: [
              "*"
            ],
            context: "ipfs://QmX9dSqGPxGZKMSrwr3tQvGVcpSfNkwhbsZ9cyxLiJXKTG",
            credentialSubject: {
              majority: {
                $eq: 18
              }
            },
            skipClaimRevocationCheck: true,
            type: "tribesIdentityCreator"
          }
        }
      ]
    }
  };

  try {
    const Log = await verifierInstace.setZKPRequest(requestIdSig, {
      metadata: JSON.stringify(invokeRequestMetadata),
      validator: validatorAddressSig,
      data: packValidatorParams(query)
    });
    await Log.wait();
    console.log('Log info:', Log);
  } catch (e) {
    console.log('error: ', e);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
