App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    projectId: 0,
  
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
      return $.getJSON("Ranking.json", function() { });
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
      await App.renderTeammatesVoting();
      App.displayContent(true);
    },
  
    renderTeammatesVoting: async function(){
      let instance = await App.contracts.Election.deployed();
      let appStarted = await instance.appStarted();
      if (appStarted) {
        let project = await instance.projects(App.projectId);
        let numTeammates = project[3];
        console.log(parseInt(numTeammates));
        if (numTeammates > 0) {
            let candidateList = $("#candidatesList");
            candidateList.empty();
            console.log(numTeammates);
            for (var i=1; i<=numTeammates; i++) {
                let name = await instance.getTeammate(App.projectId, i);
                var candidateRow = "<tr><th>" + ($('#candidatesList tr').length + 1) + "</th><td>" + name + "</td><td></td>";
                candidateList.append(candidateRow);
            }
        } else {
            let message = "There aren't teammatess to vote";
            $("#content").append("<div class=\"alert alert-info\">"+message+"</div>");    
         }
      } else {
        let message = "The voting app is still not available. The administrator must start it."
        $("#content").html("<div class=\"alert alert-danger\">"+ message +"</div>")
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
  
    displayAccount: async function(){
      // Load account data
      web3.eth.getCoinbase(function(err, account) {
        if (err === null) {
          App.account = account;
          $("#accountAddress").html(account);
        }
      });
  
      if (App.account != null) {
        let instance = await App.contracts.Election.deployed();
        let user = await instance.candidates(App.account);
        let projectId = user[1];
        App.projectId = projectId;
        let project = await instance.projects(projectId);
        let projectName = project[1];
        $("#userinfo #username").html(user);
        $("#userinfo #userTeam").html(projectName);
      }
  
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