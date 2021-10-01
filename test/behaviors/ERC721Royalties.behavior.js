const { expect } = require("chai");
const { shouldSupportInterfaces } = require('./SupportsInterface.behavior');

const shouldBehaveLikeERC721Royalties = (contractFn) => {

    let contract, accounts, owner, newOwner, approved, operator, other, royalties;

    beforeEach(() => {
        [ contract, accounts ] = contractFn();
        [ owner, newOwner, approved, operator, other, royalties] = accounts;
    });

    shouldSupportInterfaces(() => contract, ['RoyaltiesERC2981', 'RoyaltiesFoundation', 'RoyaltiesRarible', 'RoyaltiesCreatorCore']);

    const royaltiesCorrectOnSale = (royaltiesFn) => {

        let recipient, basisPoints, saleAmount, royalty;

        beforeEach(() => {
            [ recipient, basisPoints, saleAmount, royalty ] = royaltiesFn();
        });

        it('returns correct ERC2981 royalties', async () => {
            const royalties = await contract.royaltyInfo(1, saleAmount);
            expect(royalties[0]).to.equal(recipient);
            expect(royalties[1]).to.equal(royalty);
        });
        
        it('returns correct Foundation royalties ', async () => {
            const royalties = await contract.getFees(1);
            expect(royalties[0].length).to.equal(1);
            expect(royalties[1].length).to.equal(1);
            expect(royalties[0][0]).to.equal(recipient);
            expect(royalties[1][0]).to.equal(basisPoints);
        });
        
        it('returns correct RaribleV1 royalties', async () => {
            const feeBps = await contract.getFeeBps(1);
            const feeRecipients = await contract.getFeeRecipients(1);
            expect(feeBps.length).to.equal(1);
            expect(feeRecipients.length).to.equal(1);
            expect(feeBps[0]).to.equal(basisPoints);
            expect(feeRecipients[0]).to.equal(recipient);
        });

        it('returns correct RaribleV2 royalties', async () => {
            const royalties = await contract.getRoyalties(1);
            expect(royalties[0].length).to.equal(1);
            expect(royalties[1].length).to.equal(1);
            expect(royalties[0][0]).to.equal(recipient);
            expect(royalties[1][0]).to.equal(basisPoints);
        });
    };

    context('before setting royalties', () => {

        const basisPoints = 0;
        const saleAmount = ethers.utils.parseEther('1');
        const royalty = 0;

        royaltiesCorrectOnSale(() => [ ethers.constants.AddressZero, basisPoints, saleAmount, royalty ]);
    });

    context('with royalties set', () => {

        const basisPoints = 1000;
        const saleAmount = ethers.utils.parseEther('1');
        const royalty = ethers.utils.parseEther('0.1');

        beforeEach(async () => {
            await contract.setRoyalties(royalties.address, basisPoints);
        });
        
        royaltiesCorrectOnSale(() => [ royalties.address, basisPoints, saleAmount, royalty ]);
    });

    context('after changing royalties', () => {

        const basisPoints = 500;
        const saleAmount = ethers.utils.parseEther('1');
        const royalty = ethers.utils.parseEther('0.05');

        beforeEach(async () => {
            await contract.setRoyalties(other.address, 1000);
            await contract.setRoyalties(royalties.address, basisPoints);
        });
        
        royaltiesCorrectOnSale(() => [ royalties.address, basisPoints, saleAmount, royalty ]);
    });
}

module.exports = { shouldBehaveLikeERC721Royalties };
