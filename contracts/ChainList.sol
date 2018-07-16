pragma solidity ^0.4.18;

contract ChainList {
    //state variables
    address seller;
    string name;
    string decription;
    uint256 price;

    //events 
    event LogSellArticle(
        address indexed _seller,
        string _name,
        uint256 _price
    );

    //sell an article
    function sellArticle(string _name, string _description, uint256 _price) public {
        seller = msg.sender;
        name = _name;
        decription = _description;
        price = _price;

        LogSellArticle(seller, name, price);
    }

    function getArticle() public view returns (
        address _seller, 
        string _name,
        string _decription, 
        uint256 _price
    ) {
        return(seller, name, decription, price);
    }

    
}