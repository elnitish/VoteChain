// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    address public admin;

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
        address candidateAddress;
    }

    struct Voter {
        string name;
        bool hasRegistered;
        bool hasVoted;
        uint votedTo;
    }

    mapping(address => Voter) public voters;
    mapping(uint => Candidate) public candidates;
    uint public candidatesCount = 0;
    bool public electionStart = false;
    bool public electionEnd = false;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyDuringElection() {
        require(electionStart && !electionEnd, "Election is not active");
        _;
    }

    function addCandidate(string memory name, address _address) public {
        require(!electionStart, "Can't add candidates after election starts");
        candidatesCount++;
        candidates[candidatesCount] = Candidate(
            candidatesCount,
            name,
            0,
            _address
        );
    }
    function getCandidates()
        public
        view
        returns (string[] memory, uint[] memory, address[] memory)
    {
        string[] memory candidatesName = new string[](candidatesCount);
        uint[] memory candidatesID = new uint[](candidatesCount);
        address[] memory candidatesAdd = new address[](candidatesCount);
        for (uint i = 1; i <= candidatesCount; i++) {
            candidatesName[i - 1] = candidates[i].name;
        }
        for (uint i = 1; i <= candidatesCount; i++) {
            candidatesID[i - 1] = candidates[i].id;
        }
        for (uint i = 1; i <= candidatesCount; i++) {
            candidatesAdd[i - 1] = candidates[i].candidateAddress;
        }

        return (candidatesName, candidatesID, candidatesAdd);
    }

    function addVoter(address _voter, string memory name) public {
        require(!voters[_voter].hasRegistered, "Voter already registered");
        voters[_voter] = Voter(name, true, false, 0);
    }

    function getVoterStats(
        address _address
    ) public view returns (bool[] memory) {
        bool[] memory stats = new bool[](2);
        stats[0] = voters[_address].hasRegistered;
        stats[1] = voters[_address].hasVoted;
        return stats;
    }

    function startVoting() public onlyAdmin {
        require(
            !electionStart && !electionEnd,
            "Election already started or ended"
        );
        electionStart = true;
    }

    function vote(uint _candidateID) public onlyDuringElection {
        Voter storage sender = voters[msg.sender];
        require(sender.hasRegistered, "You are not registered to vote");
        require(!sender.hasVoted, "You have already voted");
        require(
            _candidateID > 0 && _candidateID <= candidatesCount,
            "Invalid candidate ID"
        );

        sender.hasVoted = true;
        sender.votedTo = _candidateID;
        candidates[_candidateID].voteCount++;
    }

    function endVoting() external {
        require(
            electionStart && !electionEnd,
            "Election not in correct state to end"
        );
        electionEnd = true;
    }

    function getWinner()
        public
        view
        returns (string memory winnerName, uint voteCounts)
    {
        require(electionEnd, "Voting has not ended yet");

        uint maxVotes = 0;
        uint winnerId;

        for (uint i = 1; i <= candidatesCount; i++) {
            if (candidates[i].voteCount > maxVotes) {
                maxVotes = candidates[i].voteCount;
                winnerId = i;
            }
        }

        winnerName = candidates[winnerId].name;
        voteCounts = candidates[winnerId].voteCount;
    }
}
