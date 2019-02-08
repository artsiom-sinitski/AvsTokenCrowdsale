App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 0,
    tokensSold: 0,
    totalSupply : 0,


    init: function() {
        console.log("App initialized.");
        return App.initWeb3();
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
          return App.initContracts();
    },


    initContracts: function() {
        $.getJSON("AvsTokenCrowdsale.json", function(avsTokenCrowdsale) {
            App.contracts.AvsTokenCrowdsale = TruffleContract(avsTokenCrowdsale);
            App.contracts.AvsTokenCrowdsale.setProvider(App.web3Provider);
            App.contracts.AvsTokenCrowdsale.deployed().then(function(avsTokenCrowdsale) {
            console.log("AvsToken Crowdsale address:", avsTokenCrowdsale.address);
        });
        }).done(function() {
            $.getJSON("AvsToken.json", function(avsToken) {
                App.contracts.AvsToken = TruffleContract(avsToken);
                App.contracts.AvsToken.setProvider(App.web3Provider);
                App.contracts.AvsToken.deployed().then(function(avsToken) {
                    console.log("AvsToken address:", avsToken.address);
                });
      
                //App.listenForEvents();
                return App.render();
            });
        });
    },


    render: function() { 
        if(App.loading) { return; }
        App.loading = true;

        var loader = $('#loader');
        var content = $('#content');

        loader.show();
        content.hide();

        // load user account data
        web3.eth.getCoinbase(function(err, account) {
            if(err === null) {
                App.account = account;
                $('#accountAddress').html(account);
            }
        });

        // Load AvS token crowdsale contract
        var avsTokenCrowdsaleInstance;
        var avsTokenInstance;
        App.contracts.AvsTokenCrowdsale.deployed().then(function(instance) {
            avsTokenCrowdsaleInstance = instance;
            return App.contracts.AvsToken.deployed();
        }).then(function(instance) {
            avsTokenInstance = instance;
            return avsTokenCrowdsaleInstance.tokenPrice();
        }).then(function(tokenPrice) {
            App.tokenPrice = tokenPrice;
            $('.token-price').html(web3.fromWei(App.tokenPrice, 'ether').toNumber());
            return avsTokenCrowdsaleInstance.tokensSold();
        }).then(function(tokensSold) {
            App.tokensSold = tokensSold.toNumber();
            $('.tokens-sold').html(App.tokensSold);
            return avsTokenInstance.totalSupply();
        }).then(function(totalSupply ) {
            App.totalSupply  = totalSupply.toNumber();      
            $('.tokens-available').html(App.totalSupply);

            var progressPercent = (App.tokensSold / App.totalSupply ) * 100;
            $('#progress').css('width', progressPercent + '%');

            //Load AvS token contract
            App.contracts.AvsToken.deployed().then(function(instance) {
                AvsTokenInstance = instance;
                return AvsTokenInstance.balanceOf(App.account);
            }).then(function(balance) {
                tokensBalance = balance;
                $('.tokens_balance').html(tokensBalance.toNumber());

                App.loading = false;
                loader.hide();
                content.show();
            });
        });
    },


    buyTokens: function() {
        $('#content').hide();
        $('#loader').show();

        var numOfTokens = $('#numOfTokens').val();
        App.contracts.AvsTokenCrowdsale.deployed().then(function(instance) {
            
        //Debugging logs
        console.log("# of Tokens: ", numOfTokens);
        console.log("Account: ", App.account);
        console.log("Value: ", numOfTokens * App.tokenPrice);
        console.log("Token Price: ", App.tokenPrice.toNumber());

        return instance.buyTokens(numOfTokens,
                                  {from: App.account,
                                  value: numOfTokens * App.tokenPrice,
                                    gas: 500000
                                   });
        }).then(function(result) {
            console.log("Tokens bought...");
            $('form').trigger('reset') // reset num of tokens in form
            $('#content').show();
            $('#loader').hide();
        });
    }
}


$(function() {
    $(window).load(function() {
        App.init();
    })
});