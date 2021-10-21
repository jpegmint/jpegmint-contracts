const { expect } = require('chai');
const { ethers } = require('ethers');

const INTERFACES = {
    ERC165: [
        'supportsInterface(bytes4)',
    ],
    ERC721: [
        'balanceOf(address)',
        'ownerOf(uint256)',
        'approve(address,uint256)',
        'getApproved(uint256)',
        'setApprovalForAll(address,bool)',
        'isApprovedForAll(address,address)',
        'transferFrom(address,address,uint256)',
        'safeTransferFrom(address,address,uint256)',
        'safeTransferFrom(address,address,uint256,bytes)',
    ],
    ERC721Enumerable: [
        'totalSupply()',
        'tokenOfOwnerByIndex(address,uint256)',
        'tokenByIndex(uint256)',
    ],
    ERC721Metadata: [
        'name()',
        'symbol()',
        'tokenURI(uint256)',
    ],
    ERC1155: [
        'balanceOf(address,uint256)',
        'balanceOfBatch(address[],uint256[])',
        'setApprovalForAll(address,bool)',
        'isApprovedForAll(address,address)',
        'safeTransferFrom(address,address,uint256,uint256,bytes)',
        'safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)',
    ],
    ERC1155Receiver: [
        'onERC1155Received(address,address,uint256,uint256,bytes)',
        'onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)',
    ],
    RoyaltiesERC2981: [
        'royaltyInfo(uint256,uint256)'
    ],
    RoyaltiesFoundation: [
        'getFees(uint256)'
    ],
    RoyaltiesRarible: [
        'getFeeRecipients(uint256)',
        'getFeeBps(uint256)'
    ],
    RoyaltiesManifold: [
        'getRoyalties(uint256)'
    ],
    Ownable: [
        'owner()',
        'renounceOwnership()',
        'transferOwnership(address)',
    ],
    AccessControl: [
        'hasRole(bytes32,address)',
        'getRoleAdmin(bytes32)',
        'grantRole(bytes32,address)',
        'revokeRole(bytes32,address)',
        'renounceRole(bytes32,address)',
    ],
    AccessControlEnumerable: [
        'getRoleMember(bytes32,uint256)',
        'getRoleMemberCount(bytes32)',
    ],
    Governor: [
        'name()',
        'version()',
        'COUNTING_MODE()',
        'hashProposal(address[],uint256[],bytes[],bytes32)',
        'state(uint256)',
        'proposalSnapshot(uint256)',
        'proposalDeadline(uint256)',
        'votingDelay()',
        'votingPeriod()',
        'quorum(uint256)',
        'getVotes(address,uint256)',
        'hasVoted(uint256,address)',
        'propose(address[],uint256[],bytes[],string)',
        'execute(address[],uint256[],bytes[],bytes32)',
        'castVote(uint256,uint8)',
        'castVoteWithReason(uint256,uint8,string)',
        'castVoteBySig(uint256,uint8,uint8,bytes32,bytes32)',
    ],
    GovernorTimelock: [
        'timelock()',
        'proposalEta(uint256)',
        'queue(address[],uint256[],bytes[],bytes32)',
    ],
};

function ERC165(functionSignatures = []) {
    const INTERFACE_ID_LENGTH = 4;

    const interfaceIdBuffer = functionSignatures
        .map(signature => ethers.utils.id(signature)) // keccak256
        .map(h =>
            Buffer
                .from(h.substring(2), 'hex')
                .slice(0, 4) // bytes4()
        )
        .reduce((memo, bytes) => {
            for (let i = 0; i < INTERFACE_ID_LENGTH; i++) {
                memo[i] = memo[i] ^ bytes[i]; // xor
            }
            return memo;
        }, Buffer.alloc(INTERFACE_ID_LENGTH));

    return `0x${interfaceIdBuffer.toString('hex')}`;
}

const INTERFACE_IDS = {};
const FN_SIGNATURES = {};
for (const k of Object.getOwnPropertyNames(INTERFACES)) {
    INTERFACE_IDS[k] =  ERC165(INTERFACES[k]);
    for (const fnName of INTERFACES[k]) {
        // the interface id of a single function is equivalent to its function signature
        FN_SIGNATURES[fnName] = ERC165([fnName]);
    }
}

const shouldSupportInterfaces = (contractFn, interfaces = []) => {

    let contract;

    beforeEach(() => {
        contract = contractFn();
    });

    describe('Contract interface', () => {

        for (const k of interfaces) {
            const interfaceId = INTERFACE_IDS[k];
            describe(k, () => {
                describe('ERC165\'s supportsInterface(bytes4)', () => {
                    it('uses less than 30k gas', async () => {
                        expect(await contract.estimateGas.supportsInterface(interfaceId)).to.be.lte(30000);
                    });

                    it('claims support', async () => {
                        expect(await contract.supportsInterface(interfaceId)).to.equal(true);
                    });
                });

                for (const fnName of INTERFACES[k]) {
                    const fnSig = FN_SIGNATURES[fnName];
                    describe(fnName, () => {
                        it('has to be implemented', () => {
                            const abi = contract.interface.functions;
                            expect(Object.keys(abi).filter(fn => ERC165([fn]) === fnSig).length).to.equal(1);
                        });
                    });
                }
            });
        }
    });
}

module.exports = {
    shouldSupportInterfaces,
};
