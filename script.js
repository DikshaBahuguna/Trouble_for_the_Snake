const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");
const scoreText=document.getElementById("score");

const gameOverScreen=document.getElementById("gameOverScreen");
const finalScore=document.getElementById("finalScore");
const restartBtn=document.getElementById("restartBtn");

const grid=20;
const tiles=30;
canvas.width=grid*tiles;
canvas.height=grid*tiles;

const gameTick=100;
const snakeSpeed=150;
const mouseSpeed=100;

let snakeTimer=0;
let mouseTimer=0;

let mouseDirection="right";

const mouseRight=new Image();
mouseRight.src="assets/mouseRight.png";
const mouseLeft=new Image();
mouseLeft.src="assets/mouseLeft.png";
const mouseUp=new Image();
mouseUp.src="assets/mouseUp.png";
const mouseDown=new Image();
mouseDown.src="assets/mouseDown.png";
const snakeHeadRight=new Image();
snakeHeadRight.src="assets/snakeRight.png";
const snakeHeadLeft=new Image();
snakeHeadLeft.src="assets/snakeLeft.png";
const snakeHeadUp=new Image();
snakeHeadUp.src="assets/snakeUp.png";
const snakeHeadDown=new Image();
snakeHeadDown.src="assets/snakeDown.png";
const snakeBody=new Image();
snakeBody.src="assets/snakeBody.png";
const fruitImg=new Image();
fruitImg.src="assets/fruit.png";

let SNAKE=[{x:10,y:10}];
let dx=1;
let dy=0;

let FRUIT={
    x:20,
    y:20
};

let MOUSE={
    x:15,
    y:15,
    active:true
};

let lastMouseMove={x:0,y:0};
let score=0;
let mousePopups=[];

function updateScore(){
    scoreText.textContent=score;
}

function draw(){
    ctx.fillStyle="#222";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.strokeStyle="#3a3a3a";
    ctx.lineWidth=1;

    for(let x=0;x<=tiles;x++){
        ctx.beginPath();
        ctx.moveTo(x*grid,0);
        ctx.lineTo(x*grid,canvas.height);
        ctx.stroke();
    }

    for(let y=0;y<=tiles;y++){
        ctx.beginPath();
        ctx.moveTo(0,y*grid);
        ctx.lineTo(canvas.width,y*grid);
        ctx.stroke();
    }

    SNAKE.forEach((part,index)=>{
        let img=snakeBody;
        let size=22;

        if(index===0){
            size=40;

            if(dx===1) img=snakeHeadRight;
            else if(dx===-1) img=snakeHeadLeft;
            else if(dy===-1) img=snakeHeadUp;
            else if(dy===1) img=snakeHeadDown;
        }

        ctx.drawImage(
            img,
            part.x*grid-(size-grid)/2,
            part.y*grid-(size-grid)/2,
            size,
            size
        );
    });

    const fruitSize=55;

    ctx.drawImage(
        fruitImg,
        FRUIT.x*grid-(fruitSize-grid)/2,
        FRUIT.y*grid-(fruitSize-grid)/2,
        fruitSize,
        fruitSize
    );

    if(MOUSE.active){
        let mouseImg=mouseRight;

        if(mouseDirection==="left") mouseImg=mouseLeft;
        else if(mouseDirection==="up") mouseImg=mouseUp;
        else if(mouseDirection==="down") mouseImg=mouseDown;

        const mouseSize=48;

        ctx.drawImage(
            mouseImg,
            MOUSE.x*grid-(mouseSize-grid)/2,
            MOUSE.y*grid-(mouseSize-grid)/2,
            mouseSize,
            mouseSize
        );
    }

    ctx.font="bold 20px Arial";
    ctx.textAlign="center";

    mousePopups.forEach(popup=>{
        ctx.fillStyle="#00FFFF";
        ctx.fillText("+5",popup.x,popup.y);

        popup.y-=1;
        popup.life--;
    });

    mousePopups=mousePopups.filter(popup=>popup.life>0);
}

    ctx.fillStyle="red";
    ctx.beginPath();
    ctx.arc(
        FRUIT.x*grid+10,
        FRUIT.y*grid+10,
        7,
        0,
        Math.PI*2
    );
    ctx.fill();

    if(MOUSE.active){

    let mouseImg=mouseRight;

    if(mouseDirection==="left") mouseImg=mouseLeft;
    else if(mouseDirection==="up") mouseImg=mouseUp;
    else if(mouseDirection==="down") mouseImg=mouseDown;

    const mouseSize=45;

    ctx.drawImage(
    mouseImg,
    MOUSE.x*grid-(mouseSize-grid)/2,
    MOUSE.y*grid-(mouseSize-grid)/2,
    mouseSize,
    mouseSize
);
}
    ctx.font="bold 20px Arial";
    ctx.textAlign="center";

    mousePopups.forEach(popup=>{
        ctx.fillStyle="#00FFFF";
        ctx.fillText("+5",popup.x,popup.y);

        popup.y-=1;
        popup.life--;
});

    mousePopups=mousePopups.filter(popup=>popup.life>0);


function updateSnake(){
    const head={
        x:SNAKE[0].x+dx,
        y:SNAKE[0].y+dy
    };

    SNAKE.unshift(head);

    if(head.x===FRUIT.x&&head.y===FRUIT.y){
        score++;
        updateScore();
        spawnFruit();
    }else{
        SNAKE.pop();
    }
}

function isSnakeTile(x,y){
    return SNAKE.some(part=>
        part.x===x&&part.y===y
    );
}

function spawnFruit(){
    let x;
    let y;

    do{
        x=Math.floor(Math.random()*tiles);
        y=Math.floor(Math.random()*tiles);
    }while(isSnakeTile(x,y)||(x===MOUSE.x&&y===MOUSE.y));

    FRUIT.x=x;
    FRUIT.y=y;
}

function getOpenSpaces(x,y){
    const directions=[
        {x:1,y:0},
        {x:-1,y:0},
        {x:0,y:1},
        {x:0,y:-1}
    ];

    let openSpaces=0;

    directions.forEach(direction=>{
        const nx=x+direction.x;
        const ny=y+direction.y;

        if(
            nx<0||
            ny<0||
            nx>=tiles||
            ny>=tiles
        ){
            return;
        }

        if(isSnakeTile(nx,ny)){
            return;
        }

        openSpaces++;
    });

    return openSpaces;
}

function moveTowards(target){
    const options=[
        {x:1,y:0},
        {x:-1,y:0},
        {x:0,y:1},
        {x:0,y:-1}
    ];

    let best=null;
    let bestDistance=Infinity;

    options.forEach(move=>{
        const nx=MOUSE.x+move.x;
        const ny=MOUSE.y+move.y;

        if(nx<0||ny<0||nx>=tiles||ny>=tiles) return;
        if(isSnakeTile(nx,ny)) return;

        const distance=
            Math.abs(nx-target.x)+
            Math.abs(ny-target.y);

        if(distance<bestDistance){
            bestDistance=distance;
            best=move;
        }
    });

    if(best!==null){
        MOUSE.x+=best.x;
        MOUSE.y+=best.y;

        if(best.x===1) mouseDirection="right";
        else if(best.x===-1) mouseDirection="left";
        else if(best.y===1) mouseDirection="down";
        else if(best.y===-1) mouseDirection="up";

        lastMouseMove=best;
    }
}



function runAway(){
    const head=SNAKE[0];

    const options=[
        {x:1,y:0},
        {x:-1,y:0},
        {x:0,y:1},
        {x:0,y:-1}
    ];

    let best=null;
    let bestScore=-Infinity;

    options.forEach(move=>{
        if(
            move.x===-lastMouseMove.x &&
            move.y===-lastMouseMove.y
        ){
            return;
        }

        const nx=MOUSE.x+move.x;
        const ny=MOUSE.y+move.y;

        if(nx<0||ny<0||nx>=tiles||ny>=tiles){
            return;
        }

        if(isSnakeTile(nx,ny)){
            return;
        }

        const distanceFromSnake=
            Math.abs(nx-head.x)+
            Math.abs(ny-head.y);

        const openSpaces=getOpenSpaces(nx,ny);

        const moveScore=
            distanceFromSnake*10+
            openSpaces*3;

        if(moveScore>bestScore){
            bestScore=moveScore;
            best=move;
        }
    });

    if(best===null){
        return;
    }

    MOUSE.x+=best.x;
    MOUSE.y+=best.y;

    if(best.x===1) mouseDirection="right";
    else if(best.x===-1) mouseDirection="left";
    else if(best.y===1) mouseDirection="down";
    else if(best.y===-1) mouseDirection="up";

    lastMouseMove=best;
}

function updateMouse(){
    if(!MOUSE.active){
        return;
    }

    const head=SNAKE[0];

    const distance=
        Math.abs(MOUSE.x-head.x)+
        Math.abs(MOUSE.y-head.y);

    if(distance<=4){
        runAway();
    }else{
        moveTowards(FRUIT);
    }

    if(
        MOUSE.x===FRUIT.x&&
        MOUSE.y===FRUIT.y
    ){
        spawnFruit();
    }
}

function respawnMouse(){
    let x;
    let y;

    do{
        x=Math.floor(Math.random()*tiles);
        y=Math.floor(Math.random()*tiles);
    }while(isSnakeTile(x,y));

    MOUSE.x=x;
    MOUSE.y=y;
    MOUSE.active=true;
}

function checkMouseCollision(){
    if(!MOUSE.active){
        return;
    }

    const head=SNAKE[0];

    if(
        head.x===MOUSE.x&&
        head.y===MOUSE.y
    ){
        score+=5;
        updateScore();
        addMousePopup(head.x,head.y);

        MOUSE.active=false;

        setTimeout(()=>{
            respawnMouse();
        },30000);
    }
}
function addMousePopup(x,y){
    mousePopups.push({
        x:x*grid+10,
        y:y*grid+10,
        life:30
    });
}

function checkGameOver(){
    const head=SNAKE[0];

    if(
        head.x<0||
        head.y<0||
        head.x>=tiles||
        head.y>=tiles
    ){
        endGame();
        return;
    }

    for(let i=1;i<SNAKE.length;i++){
        if(
            head.x===SNAKE[i].x&&
            head.y===SNAKE[i].y
        ){
            endGame();
            return;
        }
    }
}
function endGame(){

    finalScore.textContent=score;

    gameOverScreen.classList.remove("hidden");

    clearInterval(gameInterval);

}

restartBtn.addEventListener("click",()=>{
    location.reload();
});

document.addEventListener("keydown",(e)=>{
    if(
        e.key==="ArrowUp"||
        e.key==="ArrowDown"||
        e.key==="ArrowLeft"||
        e.key==="ArrowRight"
    ){
        e.preventDefault();
    }

    if(e.key==="ArrowUp"&&dy!==1){
        dx=0;
        dy=-1;
    }

    if(e.key==="ArrowDown"&&dy!==-1){
        dx=0;
        dy=1;
    }

    if(e.key==="ArrowLeft"&&dx!==1){
        dx=-1;
        dy=0;
    }

    if(e.key==="ArrowRight"&&dx!==-1){
        dx=1;
        dy=0;
    }
});

function gameLoop(){
    snakeTimer+=gameTick;
    mouseTimer+=gameTick;

    if(snakeTimer>=snakeSpeed){
        updateSnake();
        checkMouseCollision();
        checkGameOver();
        snakeTimer=0;
    }

    if(mouseTimer>=mouseSpeed){
        updateMouse();
        mouseTimer=0;
    }

    draw();
}

updateScore();
draw();
const gameInterval=setInterval(gameLoop,gameTick);