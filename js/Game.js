class Game {
  constructor() {
    this.resetTitle = createElement("h2");
    this.resetButton = createButton("");

    this.leadeboardTitle = createElement("h2");

    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");
    this.playerMoving = false
    this.leftKeyActive = false
    this.upKeyActive = false
    this.blast=false
  }


  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function (data) {
      gameState = data.val();
    });
  }
  update(state) {
    database.ref("/").update({
      gameState: state
    });
  }

  start() {
    player = new Player();
    playerCount = player.getCount();

    form = new Form();
    form.display();

    car1 = createSprite(width / 2 - 50, height - 100);
    car1.addImage("car1", car1_img);
    car1.scale = 0.07;
    car1.addImage("blast", blastIMG)
   
    car2 = createSprite(width / 2 + 100, height - 100);
    car2.addImage("car2", car2_img);
    car2.scale = 0.07;
    car2.addImage("blast", blastIMG)
    
    cars = [car1, car2];
    fuelTanks = new Group()
    coins = new Group()
    obstacles = new Group()
    this.addSprites(fuelTanks, 6, fuelIMG, 0.3)
    this.addSprites(coins, 6, coinIMG, 1)


    var obstaclesPositions = [{
      x: width / 2 + 250,
      y: height - 800,
      image: obstacle2Image
    },
    {
      x: width / 2 - 150,
      y: height - 1300,
      image: obstacle1Image
    },
    {
      x: width / 2 + 250,
      y: height - 1800,
      image: obstacle1Image
    },
    {
      x: width / 2 - 180,
      y: height - 2300,
      image: obstacle2Image
    },
    {
      x: width / 2,
      y: height - 2800,
      image: obstacle2Image
    },
    {
      x: width / 2 - 180,
      y: height - 3300,
      image: obstacle1Image
    },
    {
      x: width / 2 + 180,
      y: height - 3300,
      image: obstacle2Image
    },
    {
      x: width / 2 + 250,
      y: height - 3800,
      image: obstacle2Image
    },
    {
      x: width / 2 - 150,
      y: height - 4300,
      image: obstacle1Image
    },
    {
      x: width / 2 + 250,
      y: height - 4800,
      image: obstacle2Image
    },
    {
      x: width / 2,
      y: height - 5300,
      image: obstacle1Image
    },
    {
      x: width / 2 - 180,
      y: height - 5500,
      image: obstacle2Image
    }
    ];

    this.addSprites(obstacles, obstaclesPositions.length, obstacle1Image, 0.02, obstaclesPositions)


  }

  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");

    //C39
    this.resetTitle.html("Reset Game");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width / 2 + 200, 40);

    this.resetButton.class("resetButton");
    this.resetButton.position(width / 2 + 230, 100);

    this.leadeboardTitle.html("Leaderboard");
    this.leadeboardTitle.class("resetText");
    this.leadeboardTitle.position(width / 3 - 60, 40);

    this.leader1.class("leadersText");
    this.leader1.position(width / 3 - 50, 80);

    this.leader2.class("leadersText");
    this.leader2.position(width / 3 - 50, 130);
  }

  play() {
    this.handleElements();
    this.resetGame();


    Player.getPlayersInfo();
    player.getCarsAtEnd();
    if (allPlayers !== undefined) {
      image(track, 0, -height * 5, width, height * 6);
      this.showFuel()
      this.showLife()
      this.showLeaderboard();

      //index of the array
      var index = 0;
      for (var plr in allPlayers) {
        //add 1 to the index for every loop
        index = index + 1;

        //use data form the database to display the cars in x and y direction
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;
        var currentLife = allPlayers[plr].life;
        if (currentLife <= 0) {
          cars[index - 1].changeImage("blast")
          cars[index - 1].scale = 0.3
        }
        cars[index - 1].position.x = x;
        cars[index - 1].position.y = y;

        if (index === player.index) {
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);
          this.handleFuel(index)
          this.handleCoins(index)
          this.handleObstacleCollison(index)

          if(player.life<=0){
this.blast=true
this.playerMoving=false
cars[index-1].scale=1.5
          }
          // Changing camera position in y direction
          camera.position.y = cars[index - 1].position.y;
        }
      }

      // handling keyboard events
      this.handlePlayerControls();
      const finisihline = height * 6 - 100
      if (player.positionY > finisihline) {
        gameState = 2
        player.rank += 1
        Player.updateCarsAtEnd(player.rank)
        player.update()
        this.showRank()

      }
      drawSprites();
    }
  }

  handleResetButton() { }

  showLeaderboard() {
    var leader1, leader2;
    var players = Object.values(allPlayers);
    if (
      (players[0].rank === 0 && players[1].rank === 0) ||
      players[0].rank === 1
    ) {
      // &emsp;    This tag is used for displaying four spaces.
      leader1 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;

      leader2 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;
    }

    if (players[1].rank === 1) {
      leader1 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;

      leader2 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;
    }

    this.leader1.html(leader1);
    this.leader2.html(leader2);
  }
 
  
  handlePlayerControls() {
  var a=2
    if(!this.blast){

    
    if (keyIsDown(UP_ARROW)) {
      player.positionY += 10*a;
      this.playerMoving = true
      this.upKeyActive = true
      player.update();
    }

    if (keyIsDown(DOWN_ARROW)) {
      player.positionY -= 5;
      this.playerMoving = true
       this.upKeyActive = false
      player.update();
    }



    if (keyIsDown(LEFT_ARROW) && player.positionX > width / 3 - 50) {
      player.positionX -= 5
      this.leftKeyActive = true
      player.update()
    }

    if (keyIsDown(RIGHT_ARROW) && player.positionX < width / 2 + 300) {
      player.positionX += 5
      this.leftKeyActive = false
      player.update()
    }
  }

  }

  resetGame() {
    console.log("reset game")
    this.resetButton.mousePressed(() => {
      database.ref("/").set({
        playerCount: 0,
        gameState: 0,
        players: {},
        carsAtEnd: 0
      })
      console.log("reset game 8")
      window.location.reload()
    })
  }


  addSprites(spriteGroup, numberOfSpites, spriteIMG, scale, positions = []) {
    for (let index = 0; index < numberOfSpites; index++) {
      var x
      var y
      if (positions.length > 0) {
        x = positions[index].x
        y = positions[index].y
        spriteIMG=positions[index].image
      } else {


        x = random(width / 2 + 250, width / 2 - 250)
        y = random(-height * 4.5, height - 400)
      }
        var sprite = createSprite(x, y)
        sprite.addImage("Sprite", spriteIMG)
        sprite.scale = scale
        spriteGroup.add(sprite)

      }
    
  }

  handleFuel(index) {
    cars[index - 1].overlap(fuelTanks, function (collecter, collected) {
      player.fuel = 185
      collected.remove()
    })
    if (player.fuel > 0 && this.playerMoving) {
      player.fuel -= 0.3
    }
    if (player.fuel <= 0) {
      gameState = 2
      this.gameOver()
    }

  }


  handleCoins(index) {
    cars[index - 1].overlap(coins, function (collecter, collected) {
      player.score += 10
      collected.remove()
      player.update()
    })



  }

  handleObstacleCollison(index) {
    if (cars[index - 1].collide(obstacles)) {
      if (this.leftKeyActive) {
        player.positionX += 100
      }
      else {
        player.positionX -= 100
      }
      if (this.upKeyActive) {
        player.positionY += 100
      }
      else {
        player.positionY -= 100
      }
      if (player.life > 0) {
        player.life -= 185 / 4
      }
      player.update()
    }
  }

  handleCarCollisionCarB(index) {
    if (index === 1) {
      if (cars[index - 1].collide(cars[1])) {
        if (this.leftKeyActive) {
          player.positionX += 100
        }
        else {
          player.positionX -= 100
        }
        if (this.upKeyActive) {
          player.positionY += 100
        }
        else {
          player.positionY -= 100
        }
        if (player.life > 0) {
          player.life -= 185 / 4
        }
        player.update()
      }
    }

    if(index===2){
      if(cars[index-1].collide(cars[0])){
        if (this.leftKeyActive) {
          player.positionX += 100
        }
        else {
          player.positionX -= 100
        }
        if (this.upKeyActive) {
          player.positionY += 100
        }
        else {
          player.positionY -= 100
        }
        if (player.life > 0) {
          player.life -= 185 / 4
        }
        player.update()
      }

  }
}




showRank() {

  swal({
    title: `Awesome!${"\n"}Rank${"\n"}${player.rank}`,
    text: "You reached the finish line successfully",
    imageUrl: "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
    imageSize: "100x100",
    confirmButtonText: "Ok"
  })




}
showLife() {
  push()
  image(heart, width / 2 - 170, height - player.positionY - 300, 50, 50)
  fill("white")
  rect(width / 2 - 100, height - player.positionY - 300, 185, 20)
  fill("Red")
  rect(width / 2 - 100, height - player.positionY - 300, player.life, 20)
  noStroke()
  pop()

}

showFuel() {
  push()
  image(fuelIMG, width / 2 - 170, height - player.positionY - 350, 40, 40)
  fill("white")
  rect(width / 2 - 100, height - player.positionY - 350, 185, 20)
  fill("orange")
  rect(width / 2 - 100, height - player.positionY - 350, player.fuel, 20)
  noStroke()
  pop()

}



gameOver() {
  swal({
    title: `Awesome! You Ran Out of Fuel${"\n"}{"\n"}${player.rank}`,
    text: "Game Over",
    imageUrl: " https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png",
    imageSize: "100x100",
    confirmButtonText: "Try Again?"
  })



}


}