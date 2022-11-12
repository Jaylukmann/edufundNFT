
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EduFundNFT", function () {
  this.timeout(50000);

  let eduFundNFT;
  let owner;
  let acc1;
  let acc2;

  this.beforeEach(async function () {
    // This is executed before each test
    // Deploying the smart contract
    const EduFundNFT = await ethers.getContractFactory("EduFundNFT");
    [owner, acc1, acc2] = await ethers.getSigners();

    eduFundNFT = await EduFundNFT.deploy();
  });

  it("Should set the right owner", async function () {
    expect(await eduFundNFT.owner()).to.equal(owner.address);
  });

  it("Should mint one NFT", async function () {
    expect(await eduFundNFT.balanceOf(acc1.address)).to.equal(0);

    const tokenURI = "https://example.com/1";
    const tx = await eduFundNFT.connect(owner).safeMint(acc1.address, tokenURI);
    await tx.wait();

    expect(await eduFundNFT.balanceOf(acc1.address)).to.equal(1);
  });

  it("Should set the correct tokenURI", async function () {
    const tokenURI_1 = "https://example.com/1";
    const tokenURI_2 = "https://example.com/2";

    const tx1 = await eduFundNFT.connect(owner).safeMint(acc1.address, tokenURI_1);
    await tx1.wait();
    const tx2 = await eduFundNFT.connect(owner).safeMint(acc2.address, tokenURI_2);
    await tx2.wait();

    expect(await eduFundNFT.tokenURI(0)).to.equal(tokenURI_1);
    expect(await eduFundNFT.tokenURI(1)).to.equal(tokenURI_2);
  });

  it("Should create facility", async function(){
    const _tokenId = "2";
    const price = ethers.utils.parseUnits("2", "ether");
    expect(await eduFundNFT.balanceOf(owner.address)).to.equal(0);
    const tx = await eduFundNFT.connect(owner)._mint(owner.address, _tokenId);
    await tx.wait(); 
    expect(await eduFundNFT.balanceOf(owner.address)).to.equal(1);
    const tx1 = await eduFundNFT.connect(owner).listNFT(_tokenId,price);
    await tx1.wait(); 
    expect(await eduFundNFT.balanceOf(owner.address)).to.equal(0);
   })

  it("Should list eduFundNFT", async function(){
    //  expect(eduFundNFT.connect(owner).listNFT().to.be.revertedWith(
    //   "Price must be greater than zero"));
    const _tokenId = "1";
    expect(await eduFundNFT.balanceOf(owner.address)).to.equal(0);
    const tx = await eduFundNFT.connect(owner)._mint(owner.address, _tokenId);
    await tx.wait(); 
    expect(await eduFundNFT.balanceOf(owner.address)).to.equal(1);
    const price = ethers.utils.parseUnits("2", "ether");
    const tx1 = await eduFundNFT.connect(owner).listNFT(_tokenId,price);
    await tx1.wait(); 
    expect(await eduFundNFT.balanceOf(owner.address)).to.equal(0);
    // expect(await eduFundNFT.balanceOf()).to.equal(1);
   })

   it("Should buy an eduFundNFT to fund education", async function(){
    const _tokenId = "2";
    const price = ethers.utils.parseUnits("2", "ether");
    expect(await eduFundNFT.balanceOf(owner.address)).to.equal(0);
    const tx = await eduFundNFT.connect(owner)._mint(owner.address, _tokenId);
    await tx.wait(); 
    expect(await eduFundNFT.balanceOf(owner.address)).to.equal(1);
    const tx1 = await eduFundNFT.connect(owner).listNFT(_tokenId,price);
    await tx1.wait(); 
    // expect(await eduFundNFT.connect(acc1.address)
    // .buyNFT_to_fund_Edu().to.be.revertedWith(
    //   "Value must be equal to NFT price"));
     expect(await eduFundNFT.balanceOf(acc1.address)).to.equal(0);
    // expect(await (valueSent).to.equal(price));
    //  const tx2 = await eduFundNFT.connect(acc1).buyNFT_to_fund_Edu(_tokenId);
    //  await tx2.wait();
    //expect(await eduFundNFT.buyNFT_to_fund_Edu({value:valueSent}));
    //
    // expect(await eduFundNFT.balanceOf(acc1.address)).to.equal(1);
    
  })

  it("Should relist eduFundNFT", async function(){
  //  expect(await eduFundNFT.connect(acc1).relist()).to.be.revertedWith(
  //     "Only new NFT owner Can relist");
  //   expect(await eduFundNFT.connect(acc1).relist()).to.be.revertedWith(
  //       "Value Must be Equal To NFT price");
  const _tokenId = "2";
  expect(await eduFundNFT.balanceOf(owner.address)).to.equal(0);
  const tx = await eduFundNFT.connect(owner)._mint(owner.address, _tokenId);
  await tx.wait(); 
  expect(await eduFundNFT.balanceOf(owner.address)).to.equal(1);
  const price = ethers.utils.parseUnits("2", "ether");
  const tx1 = await eduFundNFT.connect(owner).listNFT(_tokenId,price);
  await tx1.wait(); 
  expect(await eduFundNFT.balanceOf(owner.address)).to.equal(0);
  
   
  })

  
  
  it("Should get the facility", async function(){
    const price = ethers.utils.parseUnits("2", "ether");

    await eduFundNFT
    .connect(owner)
    .createFacility("https://example.org/1", price);
     await eduFundNFT
    .connect(acc1)
    .getFacility(0);
  })

  it("Should get the owner of the contract", async function(){
    await eduFundNFT.connect(owner).getContractOwner();
  });
});