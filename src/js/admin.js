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
      
      let instance = await App.contracts.Election.deployed();
      let started = await instance.appStarted();
      let status = $("#appStatus");
  
      if(started){
        status.text("Application Started. Users can now vote. Registrations are over.");
      }else{
        status.text("Not started. Registrations opened.");
      }
  
      App.displayContent(true);
    },
  
    addUser: async function() {
  
      let instance = await App.contracts.Election.deployed();
      await instance.appStart();
  
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