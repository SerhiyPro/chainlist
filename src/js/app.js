App = {
      web3Provider: null,
      contracts: {},
      account: 0x0,

      init: function () {

            return App.initWeb3();
      },

      initWeb3: function () {
            //initialize web3 object by MetaMask
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);

            App.displayAccountInfo();

            return App.initContract();
      },

      displayAccountInfo: function () {
            web3.eth.getCoinbase(function (err, account) {
                  if (err === null) {
                        App.account = account;
                        $('#account').text(account);
                        web3.eth.getBalance(account, function (err, balance) {
                              if (err === null) {
                                    $('#accountBalance').text(web3.fromWei(balance, "ether") + " ETH")
                              }
                        })
                  }
            })
      },

      initContract: function () {
            $.getJSON('ChainList.json', function (chainListArtifact) {
                  // get the contract artifact file and use it to  instantiate a truffle contract abstraction

                  App.contracts.ChainList = TruffleContract(chainListArtifact);

                  //set the provider for our contracts
                  App.contracts.ChainList.setProvider(App.web3Provider);

                  //listen to events
                  App.listenToEvents();

                  //retrive the article from the contract
                  return App.reloadArticles();
            })
      },

      reloadArticles: function () {
            //refresh account information because the balance might have changed
            App.displayAccountInfo();

            //retreive the article placeholder and clear it
            $('#articlesRow').empty();

            App.contracts.ChainList.deployed().then(function (instance) {
                  return instance.getArticle();
            }).then(function (article) {
                  if (article[0] == 0x0) {
                        //no article to display
                        return;
                  }

                  var price = web3.fromWei(article[4], "ether");
                  //retrieve the article template and fill it
                  var articleTemplate = $('#articleTemplate');
                  articleTemplate.find('.panel-title').text(article[2]);
                  articleTemplate.find('.article-description').text(article[3]);
                  articleTemplate.find('.article-price').text(price);
                  articleTemplate.find('btn-buy').attr('data-value', price);

                  var seller = article[0];
                  if (seller == App.account) {
                        seller = "You";
                  }
                  articleTemplate.find('.article-seller').text(seller);

                  //buyer
                  var buyer = article[1];
                  if(buyer == App.account){
                        buyer = "You";
                  }else if(buyer == 0x0) {
                        buyer = "No one yet";
                  }
                  articleTemplate.find('.article-buyer').text(buyer);

                  if(article[0] == App.account  || article[1] != 0x0) {
                        articleTemplate.find('.btn-buy').hide();
                  } else {
                        articleTemplate.find('.btn-buy').show();
                  }
                  //add this article to article row
                  $('#articlesRow').append(articleTemplate.html());
            }).catch(function (err) {
                  console.error(err.message);
            });
      },

      sellArticle: function () {
            //retrive the detail of the article 

            var _article_name = $('#article_name').val();
            var _description = $('#article_description').val();
            var _price = web3.toWei(parseFloat($('#article_price').val() || 0), "ether");

            if ((_article_name.trim() == '') || (_price == 0)) {
                  //nothing to sell
                  return false;
            }

            App.contracts.ChainList.deployed().then(function (instance) {
                  return instance.sellArticle(_article_name, _description, _price, {
                        from: App.account,
                        gas: 500000
                  });
            }).then(function (result) {
            }).catch(function (err) {
                  console.error(err);
            });

      },

      //Listen to events triggered by the contract
      listenToEvents: function () {
            App.contracts.ChainList.deployed().then(function (instance) {
                  instance.LogSellArticle({}, {}).watch(function (error, event) {
                        if (!error) {
                              $('#events').append('<li class="list-group-item">' + event.args._name + ' is now for sale</li>');
                        } else {
                              console.log(error);
                        }
                        App.reloadArticles();
                  });
            });

            instance.LogBuyArticle({}, {}).watch(function (error, event) {
                  if (!error) {
                        $('#events').append('<li class="list-group-item">' + event.args._buyer + 'bought' + 'event.args._name' + '</li>');
                  } else {
                        console.log(error);
                  }
                  App.reloadArticles();
            });
      },

      buyArticle: function() {
            event.preventDefault();

            //retreive the article price
            var _price = parseFloat($(event.target).data('value'));

            App.contracts.ChainList.deployed().then(function(instance) {
                  return instance.buyArticle({
                      from: App.account,
                      value: web3.toWei(_price, "ether"),
                      gas: 500000
                  });
            }).catch(function(error){
                  console.error(error);
            });
      }
};

$(function () {
      $(window).load(function () {
            App.init();
      });
});