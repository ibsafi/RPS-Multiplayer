var app = {
    online_players  : 0,
    lobby_players   : 0,
    connection_id   : "",
    gamer_id        : "",
    stat    : $("#stat").html(),
    types   : $("#types").html(),
    right   : ["r","s","p"],
    gamer   : {
        connection_id : "",
        type : "",
        wins: 0,
        losses: 0,
    },
    opponent    : {
        connection_id : "",
        type : "",
        wins: 0,
        losses: 0,
    },
    handle_input : function(){
        switch( $(this).attr("data") ){
            case "enter":
                if(app.lobby_players < 2 && app.gamer_id.length === 0){
                    var con = gameLobbyRef.push( app.gamer );
                    app.gamer_id = con.key;
                    con.onDisconnect().remove();
                    $(this).attr("data", "exit");
                    $(this).attr("class", "btn btn-lg btn-outline-danger cmd");
                    $(this).text("Exit Lobby");
                    $("#stat").html(app.stat);
                    $("#types").html(app.types);
                    app.update_content();
                }
                break;
            case "type":
                if(app.gamer_id.length > 0){
                    app.gamer.type = $(this).text()[0].toLowerCase();
                    app.push_update();
                }
                break;
            case "exit":
                if(app.gamer_id.length > 0){
                    var gamerRef = database.ref("rps/lobby/" + app.gamer_id);
                    gamerRef.remove();
                    app.gamer_id = "";
                    $(this).attr("data", "enter");
                    $(this).attr("class", "btn btn-lg btn-outline-primary cmd");
                    $(this).text("Enter Lobby");
                    $("#stat").empty();
                    $("#types").empty();
                    app.update_content();
                }
                break;
        }
        
    },
    update_content  : function(){
        $("#online-players").text( app.online_players + " player" );
        $("#lobby-players").text( app.lobby_players + " player" );
        $("#gamer-wins").text(app.gamer.wins + " win");
        $("#opponent-wins").text(app.opponent.wins + " win");
        $("#gamer-losses").text(app.gamer.losses + " loss");
        $("#opponent-losses").text(app.opponent.losses + " loss");
    },
    handle_coming_update : function(){

        if(app.lobby_players === 2){
            if((app.gamer.type.length*app.opponent.type.length) !== 0){
                if( (app.right.indexOf(app.gamer.type) - app.right.indexOf(app.opponent.type)) === -1 ||
                (app.right.indexOf(app.gamer.type) - app.right.indexOf(app.opponent.type)) === 2){
                    app.gamer.wins++;
                }else{
                    if(app.right.indexOf(app.gamer.type) !== app.right.indexOf(app.opponent.type)){
                        app.gamer.losses++;
                    }
                }
                app.gamer.type = "";
                app.push_update();
            }
        }
        app.update_content();
    },
    push_update : function(){
        if(app.gamer_id.length > 0){
            var gamerRef = database.ref("rps/lobby/" + app.gamer_id);
            gamerRef.set(app.gamer);
        }   
    },
    init   : function(){
        $("#stat").empty();
        $("#types").empty();
    }

};


var config = {
    apiKey: "AIzaSyD5NS1clx9lzBNUKZTr7KK8wpyojSEBwfY",
    authDomain: "test-ad1be.firebaseapp.com",
    databaseURL: "https://test-ad1be.firebaseio.com",
    projectId: "test-ad1be",
    storageBucket: "test-ad1be.appspot.com",
    messagingSenderId: "81815837843"
  };
  firebase.initializeApp(config);

  // Create a variable to reference the database.
var database = firebase.database();

var connectionsRef = database.ref("rps/connections");

var gameLobbyRef = database.ref("rps/lobby");

var connectedRef = database.ref(".info/connected");

connectedRef.on("value", function(snap) {
    // If they are connected..
    if(snap.val()){
      // Add user to the connections list.
      var con = connectionsRef.push(true);

      app.connection_id = con.key;
      app.gamer.connection_id = con.key;

      // Remove user from the connection list when they disconnect.
      con.onDisconnect().remove();
    }
  });

connectionsRef.on("value", function(snap) {
    app.online_players = snap.numChildren();
  });

gameLobbyRef.on("value", function(snap) {
    app.lobby_players = snap.numChildren();
    app.opponent = {
        connection_id : "",
        type : "",
        wins: 0,
        losses: 0,
    };
    
    for(var key in snap.val()){
        if( snap.val()[key].connection_id !== app.connection_id ){ //There is an opponent
            app.opponent = snap.val()[key];
        }
    }
    app.handle_coming_update();
});

  $( document ).on("click", ".cmd", app.handle_input);
  setTimeout(app.init, 50);