App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    projectId: 0,
    username: "",
  
    main: async function() {
      try {
          // Get Provider
          await App.initWeb3();
  
          // Load Smart Contract
          let electionContract = await App.initContract();
          App.contracts.Ranking = TruffleContract(electionContract);
          App.contracts.Ranking.setProvider(App.web3Provider);
          
          //Render Page
          await App.render();
  
      } catch (err) {
          console.log(err);
      }
    },
  
    initWeb3: async function() {
      
      if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
        App.web3Provider = web3.currentProvider;
        web3 = new Web3(web3.currentProvider);
      } else {
        // Specify default instance if no web3 instance provided
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        web3 = new Web3(App.web3Provider);
      }
    },
  
    initContract: function() {
      return $.getJSON("Ranking.json", function () { });
    },
  
    
    render: async function() {
      App.displayContent(false);
      App.displayAccount();
      await App.renderTeamRanking();
      App.displayContent(true);
    },
  
    displayContent: function(display) {
      let loader = $("#loader");
      let content = $("#content");
      if (display) {
          loader.hide();
          content.show();
      } else {
          loader.show();
          content.hide();
      }
    },
  
    displayAccount: async function(){
      // Load account data
      if (web3.currentProvider.isMetaMask) {
        ethereum.on('accountsChanged', function (accounts) {
          let account = accounts[0];
          App.account = account;
          $("#accountAddress").html(account);
        });
        
        ethereum.enable();
      } else {
        web3.eth.getCoinbase(function(err, account) {
          if (err === null) {
            App.account = account;
            $("#accountAddress").html(account);
          }
        });
      }
    },
  
    renderTeamRanking: async function() {
      let instance = await App.contracts.Ranking.deployed();
      let appStarted = await instance.appStarted();
  
      if (appStarted) {
        let numProjects = await instance.projectCount();
        let rankingResults = $("#rankingResults")

        rankingResults.empty();
  
        for (var idTeam = 1; idTeam <= numProjects; idTeam++) {

            let team = await instance.projects(idTeam);
            let id = team[0];
            let name = team[1];
            let rank = team[2];
            let timesRanked = team[4];
            
            let questions = await instance.getQuestionPoints(idTeam,);
            questionPoints = "<td></td><td></td><td></td><td></td><td></td>"

            if (questions != undefined) {
                let total = parseInt(questions[0]) + parseInt(questions[1]) + parseInt(questions[2]) + parseInt(questions[3]);
                console.log(total);
                questionPoints = "<td>"+questions[0]+"</td><td>"+questions[1]+"</td><td>"+questions[2]+"</td><td>"+questions[3]+"</td><td>" + total + "</td>"
            }
            var rankingTemplate = "<tr id=\""+ id +"\"><th>" + ($('#rankingResults tr').length + 1) + "</th>" + 
                "<td>" + name + "</td>" + questionPoints + "<td>" + rank/timesRanked + "</td></tr>";
            
            rankingResults.append(rankingTemplate);
        }
      } else {
        let message = "The voting app is still not available. The administrator must start it."
        $("#content").html("<div class=\"alert alert-danger\">"+ message +"</div>")
      }
    }
  };
  
  $(function() {
    $(window).load(function() {
      App.main();
    });
  });