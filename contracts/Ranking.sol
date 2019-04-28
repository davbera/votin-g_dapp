pragma solidity ^0.5.0;

contract Ranking {

    // Structures
    struct Candidate {
        string name;
        uint projectId;
        bool rankedProject;
        bool votedTeammates;
        mapping(uint => bool) votedProject;
    }

    struct Project {
        // id del proyecto
        uint id;
        string name;
        uint rank;
        uint count; // Number of people in a project
        uint timesRanked;
        mapping(uint => uint) questionPoints;
        mapping(uint => Candidate) teammates;
    }

    // Mappings
    mapping(address => Candidate) public candidates;
    mapping(uint => Project) public projects;

    // Variables
    uint8 private NUM_QUESTION = 4;

    address private admin;
    bool public appStarted;
    uint public userCount;
    uint public projectCount;


    constructor(address adminAddress) public {
        admin = adminAddress;
        appStarted = false;
        userCount = 0;
        projectCount = 0;
    }

    function addProject(string memory name) public payable {
        require(msg.sender == admin);
        require(appStarted == false); 
        projectCount++;
        projects[projectCount] = Project(projectCount, name, 0, 0,0);
    }

    function addUser(address secAddress, uint projectId, string memory name) public payable {
        require(msg.sender == admin);
        require(appStarted == false);
        require(projects[projectId].id > 0);
        projects[projectId].count++;
        userCount++;
        // If users can register by themselve 
        //projects[projectId].candidates[projects[projectId].count] = msg.sender;

        candidates[secAddress] = Candidate(name, projectId, false, false);
        projects[projectId].teammates[projects[projectId].count] = candidates[secAddress];
        //teammates[projectId][projects[projectId].count] = candidates[secAddress].name;
    }

    function appStart() public payable {
        require(msg.sender == admin);
        require(appStarted == false);
        appStarted = true;
    }

    function getQuestionPoints(uint projectId) external view returns (uint, uint, uint, uint) { 
        /*uint[] memory ret = new uint[](4);
        for (uint i = 0; i < 4; i++) {
            ret[i] = projects[projectId].questionPoints[i];
        }*/
        return (projects[projectId].questionPoints[0], projects[projectId].questionPoints[1], projects[projectId].questionPoints[2], projects[projectId].questionPoints[3]);
    }

    function hasVoted(uint projectId) external view returns (bool) { 
        return (candidates[msg.sender].votedProject[projectId]);
    }

    function voteProject(uint projectId, uint[] memory votes) public payable {
        require(projectId > 0);
        require(projectId <= projectCount);
        require(appStarted == true);
        require(candidates[msg.sender].projectId > 0);
        require(candidates[msg.sender].projectId != projectId);
        require(candidates[msg.sender].votedProject[projectId] == false);
        require(votes.length == NUM_QUESTION);
  
        for(uint i = 0; i < votes.length; i++){
            projects[projectId].questionPoints[i] += votes[i];
        }

        candidates[msg.sender].votedProject[projectId] = true;
    }

    function rankProject(uint[] memory votes) public payable {
        require(appStarted == true);
        require(candidates[msg.sender].projectId > 0);
        require(candidates[msg.sender].rankedProject == false);
  
        for(uint i = 0; i < votes.length; i++){
            projects[i+1].rank += votes[i];
            if (candidates[msg.sender].projectId != i+1) {
                projects[i+1].timesRanked += 1;
            }
        }
        candidates[msg.sender].rankedProject = true;
    }

    function getTeammate(uint projectId, uint teammateId) external view returns (string memory) {
        require(projectId > 0);
        require(teammateId > 0);

        return projects[projectId].teammates[teammateId].name;
    }
 /*   function getTeammates(uint projectId) external view returns (bytes32[] memory){
        require(projectId > 0);
        bytes32[] memory res = new bytes32[](projects[projectId].count-1);
        uint cont = 0;
        for (uint i=0; i<projects[projectId].count; i++) {
            
            if (!compareStrings(projects[projectId].teammates[i+1].name, candidates[msg.sender].name)) {  
                res[cont] = stringToBytes32(projects[projectId].teammates[i+1].name);
                cont ++;
            }
            
        }
        return res;
    }

    function stringToBytes32(string memory source) pure private returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }

    function compareStrings (string memory a, string memory b) private view 
       returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))) );

    }*/
    //TODO: Votar usuarios
}