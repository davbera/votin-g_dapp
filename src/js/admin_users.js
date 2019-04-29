App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  main: async function(){
    try{
      
      // Get Provider
      await App.initWeb3();

      // Load Smart Contract 
      let electionContract = await App.initContract();
      App.contracts.Election = TruffleContract(electionContract);
      App.contracts.Election.setProvider(App.web3Provider);

      // Render Page
      await App.render();

    } catch(er){
      console.log(er);
    }
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    //return App.initContract();
  },

  initContract: function() {
    return $.getJSON("Election.json", function() { });
  },

  displayContent: function(display) {
    var loader = $("#loader");
    var content = $("#content");
    if(display){
      loader.hide();
      content.show()
    }else{
      loader.show();
      content.hide();
    }
  },

  render: async function() {
    App.displayContent(false);
    App.displayAccount(); // async
    await App.renderCandidateList();
    App.displayContent(true);
  },

  renderCandidateList: async function(){

    let instance = await App.contracts.Election.deployed();
    let candidatesCount = await instance.userCount();

    let projects = await App.getProjects(instance);

    let candidateList = $("#candidatesList");
    candidateList.empty();

    // for (var i = 1; i <= candidatesCount; i++){
    //   candidateAddress = await instance.candidatesList(i);
    //   candidate = await instance.candidates(candidateAddress);
    //   var candidateRow = `<tr><th>${candidate[0]}</th><td>${projects[candidate[1]-1][1]}</td><td>${candidate[2]}</td>`;
    //   candidateList.append(candidateRow);
    // }

    var userProjectSelector = $('#userProject');
    userProjectSelector.empty();

    for (var i = 0; i < projects.length; i++){
      let project = projects[i];
      let num_candidates = project[3];
      let projectOption = `<option value='${i+1}'>${project[1]}</option>`
      userProjectSelector.append(projectOption);

      for (var j = 1; j <= num_candidates ; j++){
        candidateAddress = await instance.getProjectCandidate(i+1,j);
        candidate = await instance.candidates(candidateAddress);
        var candidateRow = `<tr><th>${candidate[0]}</th><td>${projects[candidate[1]-1][1]}</td><td>${candidate[4]}</td><td>${candidate[2]?'Yes':'No'}</td><td>${candidate[3]?'Yes':'No'}</td>`;
        candidateList.append(candidateRow);
      }
    }

  },

  getProjects: async function(instance) {
    let projectsCount = await instance.projectCount();
    let projects = [];

    for (let i = 1; i<= projectsCount; i++){
      let project = await instance.projects(i);
      projects.push(project);
    }
    return projects;
  },

  addUser: async function() {

    let instance = await App.contracts.Election.deployed();
    let userName = $("#userName").val();
    let userAddress = $("#userAddress").val();
    let userProject = $("#userProject").val();
    try {
    //  $("#message").remove();
      await instance.addUser(userAddress, userProject, userName, { from: App.account });
      $("input").val("");
   //   let message = "<div id=\"message\" class=\"alert alert-info\">User successfully created</div>"
   //   $("#content").insertBefore(message)
      await App.renderCandidateList();
    } catch(er) {
      console.log(er);
    }

  },


  displayAccount: function(){
    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });
  },

  // listenForEvents: function() {
  //   App.contracts.Election.deployed().then(function(instance) {
  //     instance.votedEvent({}, {
  //       fromBlock: 'latest'
  //       // fromBlock: 0,
  //       // toBlock: 'latest'
  //     }).watch(function(error, event) {
  //       console.log("event triggered", event)
  //       // Reload when a new vote is recorded
  //       //App.render();
  //     });
  //   });
  // }

};

$(function() {
  $(window).load(function() {
    App.main();
  });
});