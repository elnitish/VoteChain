let { expect } = require("chai");
let { ethers } = require("hardhat");


describe("Voting contract", function () {
  let Voting, voting, owner, add1, add2;

  beforeEach(async () => {
    [owner, add1, add2] = await ethers.getSigners();
    Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy();
  })

  it("Should deploy with correct admin", async () => {
    expect(await voting.admin()).to.equal(owner.address);
  });

  it("Should add the candidates correctly", async () => {
    await voting.addCandidate("Nitish");
    let candidate = await voting.candidates(1);
    expect(candidate.name).to.equal("Nitish");
    expect(candidate.voteCount).to.equal(0);
  });

  it("Should start voting correctly", async () => {
    await voting.startVoting();
    // console.log(await voting.electionStart);
    expect(await voting.electionStart()).to.equal(true);
  })

  it("Should vote correctly", async () => {
    await voting.addCandidate("Nitish");
    await voting.addCandidate("Parth");
    await voting.addVoter(add1.address);
    await voting.addVoter(add2.address);
    let voter1 = await voting.voters(add1.address);
    let voter2 = await voting.voters(add2.address);
    await voting.startVoting();
    expect(await voter1.hasVoted).to.equal(false);
    expect(await voter2.hasVoted).to.equal(false);

    await voting.connect(add1).vote(1);
    await voting.connect(add2).vote(1);
    console.log(await voting.candidates(1));
    console.log(await voting.candidates(2));
    voter1 = await voting.voters(add1.address);
    voter2 = await voting.voters(add2.address);
    console.log(await voter1);
    console.log(await voter2);

    expect(await voter1.hasVoted).to.equal(true);
    expect(await voter2.hasVoted).to.equal(true);
  })

  it("Should getting the winner correctly", async()=>{
    await voting.addCandidate("Nitish");
    await voting.addCandidate("Parth");
    await voting.addVoter(add1.address);
    await voting.addVoter(add2.address);
    let voter1 = await voting.voters(add1.address);
    let voter2 = await voting.voters(add2.address);
    await voting.startVoting();
    expect(await voter1.hasVoted).to.equal(false);
    expect(await voter2.hasVoted).to.equal(false);

    await voting.connect(add1).vote(1);
    await voting.connect(add2).vote(1);
    console.log(await voting.candidates(1));
    console.log(await voting.candidates(2));
    voter1 = await voting.voters(add1.address);
    voter2 = await voting.voters(add2.address);
    console.log(await voter1);
    console.log(await voter2);

    await voting.endVoting();
    let winner = await voting.getWinner();
    console.log(winner);
    expect(winner).to.equal("Nitish");
    
  })

  it("Should not allow double voting", async()=>{
    await voting.addCandidate("Nitish");
    await voting.addVoter(add1.address);
    await voting.startVoting();
    await voting.connect(add1).vote(1);
    expect(voting.connect(add1).vote(1)).to.be.revertedWith("You have already voted");
  })
}
)