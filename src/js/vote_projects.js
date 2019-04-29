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

/*  initWeb3: function() {
    if (typeof window.ethereum !== 'undefined' ||
        typeof window.web3 !== 'undefined') {
       // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = window.web3.currentProvider;
      web3 = new Web3(web3.currentProvider)

      if (web3.currentProvider.isMetaMask) {
        ethereum.on('accountsChanged', function (accounts) {
          let account = accounts[0];
          App.account = account;
          $("#userinfo #accountAddress").html(account);
        });
        
        ethereum.enable();
      } else {
        web3.eth.getCoinbase(function(err, account) {
          if (err === null) {
            App.account = account;
            $("#accountAddress").html("Your Account: " + account);
          }
        });
      }
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
      web3.eth.getCoinbase(function(err, account) {
        if (err === null) {
          App.account = account;
          $("#accountAddress").html("Your Account: " + account);
        }
      });
    }
    return App.initContract();
  },*/

  initContract: function() {
    return $.getJSON("Election.json", function () { });
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
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html(account);
      }
    });

    let instance = await App.contracts.Ranking.deployed();
    let user = await instance.candidates(App.account);
    let projectId = user[1];
    App.projectId = projectId;
    let username = user[0];
    App.username = username;
    let project = await instance.projects(projectId);
    let projectName = project[1];

    $("#userinfo #username").html(username);
    $("#userinfo #userTeam").html(projectName);
  },

  renderTeamRanking: async function() {
    let instance = await App.contracts.Ranking.deployed();
    let appStarted = await instance.appStarted();

    if (appStarted) {
      let numProjects = await instance.projectCount();
      let user = await instance.candidates(App.account)
      let hasRanked = user[2];
      let rankingResults = $("#rankingResults")
      rankingResults.empty();
      $("button").remove();

      for (var idTeam = 1; idTeam <= numProjects; idTeam++) {
        if (idTeam != App.projectId) {
          let hasVoted = await instance.hasVoted(idTeam);
  
          let team = await instance.projects(idTeam);
          let id = team[0];
          let name = team[1];
          
          let input = "<td></td><td></td><td></td><td></td>";
          let voteButton = "<td></td>";

          if (!hasVoted) { 
            input = "<td><input type=\"number\" class=\"form-control\" min=\"1\" max=\"5\" value=\"1\"/></td>"
            input = input.repeat(4);
            voteButton = "<td><button type=\"submit\" class=\"btn btn-primary\" onclick=\"vote(this)\">Vote</button></td>"
          }
          
          var rankingTemplate = "<tr id=\""+ id +"\"><th>" + ($('#rankingResults tr').length + 1) + "</th><td>" + name + "</td>" + input + "</td>" +voteButton + "<td></td></tr>"
  
          rankingResults.append(rankingTemplate);
        }
      }

      if (!hasRanked && $("#rankingResults").parent().parent().children('button').length === 0) {
        let voteButton = "<button type=\"submit\" class=\"btn btn-primary\" onclick=\"rank(this)\">Rank</button>"
        $("#rankingResults").parent().parent().append(voteButton);

        let select = "<select><option value=\"\" selected></option>"
        for (var i=1; i<numProjects; i++) {
            let candidateOption = "<option value='" + i + "' >" + i + "</ option>"
            select += candidateOption;
        }
        select += "</select>"

        $("#rankingResults tr td:last-child").append(select);

      }
    } else {
      let message = "The voting app is still not available. The administrator must start it."
      $("#content").html("<div class=\"alert alert-danger\">"+ message +"</div>")
    }
  },

  rankProject: async function(votes) {
    let instance = await App.contracts.Ranking.deployed();
    try {
        await instance.rankProject(votes, {from:App.account});
   //     await App.render();
        
    } catch (err) { 
        console.log(err); 
        let message = "There was an error while ranking. Please refresh the screen and try to vote again."
        $("#content").html("<div class=\"alert alert-danger\">"+ message +"</div>");
    }
  },

  voteProject: async function(projectId,votes) {
    let instance = await App.contracts.Ranking.deployed();
    try {
      await instance.voteProject(projectId,votes,{from:App.account});
    //  await App.render();
    } catch (err) {
      console.log(err); 
      let message = "There was an error while voting. Please refresh the screen and try to vote again."
      $("#content").html("<div class=\"alert alert-danger\">"+ message +"</div>");
    }
  }
};

$(function() {
  $(window).load(function() {
    App.main();
  });
});


function rank(elem) {
  let votes = [];
  let numProjects = $("#rankingResults").children().length + 1;
  
  $("#info-error").remove();

  let empty =  $("#rankingResults").children().find("select").filter(function() {
      return this.value === "";
  });
  if(empty.length) {
      $("<div id=\"info-error\" class=\"alert alert-danger\">All projects must be ranked</div>").insertBefore($("#rankingResults").parent())
      return
  }

  $("#rankingResults").children().each(function(i){
      let rankValue = $(this).children('td').children('select').val();

      if (App.projectId == i+1) {
          votes.push(0); //The rank of the user project is 0
      }

      votes.push(parseInt(rankValue));
  });
  if (App.projectId == $("#rankingResults").children().length + 1) { //project id is the highest, so it wasn't iterate before
      votes.push(0);
  }

  for (let i=0; i<numProjects; i++) {
      if (!votes.includes(i)) {
         $("<div id=\"info-error\" class=\"alert alert-danger\">Projects must have different rank value</div>").insertBefore($("#rankingResults").parent())
          return;
      }
  }

  App.rankProject(votes);
}


function vote(elem) {
  var votes = [];
  var projectId = $(elem).parent().parent()[0].id;

  $(elem).parent().siblings().children('input').each(function(i){
    votes[i] = parseInt($(this)[0].value);
  });

  App.voteProject(projectId, votes);
};