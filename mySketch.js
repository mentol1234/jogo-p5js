let gameState="menu";
let distances=[200,500,1000,5000];
let energyByDistance={200:1000,500:1300,1000:1800,5000:4800};
let screenUnits={200:2,500:5,1000:10,5000:15};

let clubs=["CN Amorense","KC Rio Forte","CR Maré Alta","GD Estuário","CN Atlântico","AC Ria Formosa"];
let athletesBase=[
  {name:"Mentol", club:"CN Amorense", age:13, g:"M", force:75, endu:78, tech:72, tag:"(real)"},
  {name:"Tiago Duarte", club:"CR Maré Alta", age:23, g:"M", force:82, endu:84, tech:80, tag:""},
  {name:"Rui Teixeira", club:"KC Rio Forte", age:17, g:"M", force:70, endu:73, tech:71, tag:""},
  {name:"Joana Freitas", club:"GD Estuário", age:20, g:"F", force:77, endu:79, tech:83, tag:""},
  {name:"Carla Pinto", club:"CN Atlântico", age:18, g:"F", force:74, endu:76, tech:78, tag:""},
  {name:"Daniel Pires", club:"AC Ria Formosa", age:26, g:"M", force:85, endu:88, tech:82, tag:""},
  {name:"Ana Silva", club:"CN Amorense", age:19, g:"F", force:72, endu:74, tech:75, tag:""},
  {name:"Miguel Santos", club:"KC Rio Forte", age:21, g:"M", force:78, endu:77, tech:76, tag:""},
  {name:"Sara Gomes", club:"CR Maré Alta", age:22, g:"F", force:75, endu:73, tech:74, tag:""}
];

let career={hasSave:false, athlete:null, calendar:[], currentEvent:0, results:[]};
let race={distance:200, player:null, ais:[], started:false, finished:false,
          posP:0, speedP:0, energyP:0, countdown:3, countdownStart:0};

let menuIndex=0, quickIndex={athlete:0,distance:0}, trainingIndex={distance:0}, difficulty=1;
let newAthleteDraft={name:"Atleta", club:0, age:13, g:0};
let activeButtons=[];

function setup(){ createCanvas(900,600); textFont('Arial'); frameRate(60);}
function draw(){ background(30,160,220); activeButtons=[];
  if(gameState==="menu") drawMainMenu();
  else if(gameState==="quick") drawQuickRaceMenu();
  else if(gameState==="training") drawTrainingMenu();
  else if(gameState==="options") drawOptions();
  else if(gameState==="career_menu") drawCareerMenu();
  else if(gameState==="create_athlete") drawCreateAthlete();
  else if(gameState==="calendar") drawCareerCalendar();
  else if(gameState==="race") drawRace();
}

function mousePressed(){ for(let b of activeButtons){ if(mouseX>b.x && mouseX<b.x+b.w && mouseY>b.y && mouseY<b.y+b.h){ b.callback(); break; } } }
function drawButton(x,y,w,h,labelText,callback){ let hovering = mouseX>x && mouseX<x+w && mouseY>y && mouseY<y+h; fill(hovering?200:150,200,50); rect(x,y,w,h,8); fill(0); textAlign(CENTER,CENTER); textSize(20); text(labelText,x+w/2,y+h/2); activeButtons.push({x,y,w,h,callback}); }

function titleText(t){ fill(255); textAlign(CENTER,CENTER); textSize(34); text(t,width/2,60);}
function hintText(t){ fill(245); textAlign(CENTER,CENTER); textSize(16); text(width/2,height-30,t);}
function label(x,y,t,sel=false){ fill(sel?255:230, sel?220:230, sel?120:230); textAlign(LEFT,TOP); textSize(22); text(t,x,y); }
function screenX(pos,distance){ let x0=60,x1=width-60; return map(pos,0,screenUnits[distance],x0,x1);}

/* ----------------- Main Menu ----------------- */
const mainItems=["Carreira","Jogo Rápido","Treino","Opções","Sair"];
function drawMainMenu(){
  titleText("Canoagem & SUP — Protótipo");
  for(let i=0;i<mainItems.length;i++){
    let x=width/2-100, y=150+i*40, w=200, h=30;
    let hovering = mouseX>x && mouseX<x+w && mouseY>y && mouseY<y+h;
    if(hovering) menuIndex=i;
    label(x,y,mainItems[i],hovering);
    if(hovering) drawButton(x,y,w,h,mainItems[i],()=>{
      if(mainItems[menuIndex]==="Carreira") gameState="career_menu";
      else if(mainItems[menuIndex]==="Jogo Rápido") gameState="quick";
      else if(mainItems[menuIndex]==="Treino") gameState="training";
      else if(mainItems[menuIndex]==="Opções") gameState="options";
      else if(mainItems[menuIndex]==="Sair") noLoop();
    });
  }
  hintText("Move o rato sobre a opção • Clica para escolher");
}

/* ----------------- Quick Race ----------------- */
function drawQuickRaceMenu(){
  titleText("Jogo Rápido"); fill(255); textAlign(LEFT,TOP); textSize(20); text("Escolhe Atleta:",120,140);
  for(let i=0;i<athletesBase.length;i++){
    let x=140,y=170+i*28,w=300,h=24; 
    let hovering = mouseX>x && mouseX<x+w && mouseY>y && mouseY<y+h; 
    if(hovering) quickIndex.athlete=i;
    let a=athletesBase[i]; 
    label(x+30,y,(hovering?"> ":"")+`${a.name} ${a.tag} — ${a.club}`,hovering); 
    if(hovering) fill(255,255,0), rect(x,y+2,20,20);
  }

  text("Distância:",120,400);
  for(let i=0;i<distances.length;i++){
    let x=140,y=430+i*28,w=150,h=24;
    let hovering = mouseX>x && mouseX<x+w && mouseY>y && mouseY<y+h; 
    if(hovering) quickIndex.distance=i;
    label(x+30,y,(hovering?"> ":"")+`${distances[i]} m`,hovering); 
    if(hovering) fill(255,255,0), rect(x,y+2,20,20);
  }

  drawButton(width-160,500,120,40,"Começar",()=> startRace(athletesBase[quickIndex.athlete],distances[quickIndex.distance]));
  hintText("Move o rato e clica Começar");
}

/* ----------------- Start Race ----------------- */
function startRace(player,distance){
  race.player = player; race.distance = distance; race.started=false; race.finished=false;
  race.posP = 0; race.speedP=0; race.energyP=energyByDistance[distance]; race.countdown=3; race.countdownStart=0;

  race.ais=[];
  let aisPool = athletesBase.filter(a=>a.name!==player.name);
  for(let i=0;i<8;i++){
    race.ais.push({athlete:aisPool[i], pos:0, speed:0.01+random(0,0.02)});
  }

  gameState="race";
}

/* ----------------- Race ----------------- */
function drawRace(){
  stroke(255); strokeWeight(2); 
  const x0=60,x1=width-60; line(x1-10,70,x1-10,height-80);
  noStroke(); fill(255,255,255,14);
  for(let i=0;i<9;i++) rect(x0,110+i*50,x1-x0,40);

  drawButton(width-160,500,120,40,"Remar",()=>{
    if(!race.started){
      race.started=true;
      race.countdownStart=millis();
    } else if(!race.finished){
      race.posP+=0.8; // jogador mais lento
      race.energyP-=1;
    }
  });

  if(!race.started && race.countdown>0){
    if(race.countdownStart===0) race.countdownStart=millis();
    let diff=int((millis()-race.countdownStart)/1000);
    race.countdown=max(0,3-diff);
    fill(255); textSize(48); textAlign(CENTER,CENTER); text(race.countdown>0?race.countdown:"Vai!",width/2,50);
    return; 
  }

  drawBoat(race.posP,130,true,race.player.name);
  for(let i=0;i<race.ais.length;i++){
    let a=race.ais[i];
    a.pos+=a.speed; 
    drawBoat(a.pos,180+50*i,false,a.athlete.name);
  }

  if(race.posP>=screenUnits[race.distance]){
    race.finished=true;
    drawButton(width/2-60,550,120,40,"Voltar",()=> gameState="menu");
  }
}

function drawBoat(pos,y,isPlayer,name){
  fill(isPlayer?color(255,80,60):color(255,230,90)); rect(screenX(pos,race.distance),y,50,20,8);
  fill(0); textAlign(CENTER,CENTER); textSize(12); text(name,screenX(pos,race.distance),y-16);
}

/* ----------------- Career ----------------- */
function drawCareerMenu(){
  titleText("Carreira"); fill(255); textAlign(CENTER,CENTER); textSize(20);
  if(!career.hasSave){
    text("Sem carreira ativa.",width/2,200);
    drawButton(width/2-100,240,200,40,"Novo Atleta",()=> gameState="create_athlete");
  } else {
    let a=career.athlete;
    text(`Atleta: ${a.name} — ${a.club}`,width/2,200);
    text(`Idade: ${a.age}  F:${a.force}  R:${a.endu}  T:${a.tech}`,width/2,230);
    drawButton(width/2-100,270,200,40,"Calendário",()=> gameState="calendar");
  }
}

/* ----------------- Create Athlete ----------------- */
function drawCreateAthlete(){
  titleText("Criar Atleta — Carreira");
  fill(255); textAlign(LEFT,TOP); textSize(20);
  label(120,140,"Nome: "+newAthleteDraft.name);
  label(120,180,"Clube: "+clubs[newAthleteDraft.club]);
  label(120,220,"Idade: "+newAthleteDraft.age);
  label(120,260,"Género: "+(newAthleteDraft.g===0?"Masculino":"Feminino"));

  drawButton(120,320,120,40,"Criar",()=>{
    career.athlete={name:newAthleteDraft.name,club:clubs[newAthleteDraft.club],age:newAthleteDraft.age,g:newAthleteDraft.g===0?"M":"F",force:68,endu:72,tech:70};
    career.hasSave=true;
    career.calendar=distances.map(d=>({distance:d}));
    career.currentEvent=0;
    gameState="calendar";
  });
  drawButton(260,320,120,40,"Voltar",()=> gameState="career_menu");
}

/* ----------------- Calendar ----------------- */
function drawCareerCalendar(){
  titleText("Calendário — Carreira"); fill(255); textAlign(LEFT,TOP); textSize(20);
  for(let i=0;i<career.calendar.length;i++){
    let ev=career.calendar[i]; let done=i<career.currentEvent;
    label(120,150+i*30,(done?"✓":"•")+` Prova ${i+1}: ${ev.distance} m`,i===career.currentEvent&&!done);
  }
  drawButton(120,400,120,40,"Começar",()=> startRace(career.athlete,career.calendar[career.currentEvent].distance));
  drawButton(260,400,120,40,"Voltar",()=> gameState="career_menu");
}

/* ----------------- Other Menus (Treino/Options) ----------------- */
function drawTrainingMenu(){ titleText("Treino"); fill(255); textAlign(LEFT,TOP); textSize(20); text("Distância:",120,160);
  for(let i=0;i<distances.length;i++){
    let x=140,y=190+i*28; label(x,y,distances[i]+" m",i===trainingIndex.distance);
  }
  drawButton(120,400,120,40,"Começar",()=> startRace(athletesBase[0],distances[trainingIndex.distance]));
  drawButton(260,400,120,40,"Voltar",()=> gameState="menu");
}

function drawOptions(){ titleText("Opções"); const diffs=["Fácil","Médio","Difícil"];
  for(let i=0;i<diffs.length;i++) label(width/2-100,180+i*40,"Dificuldade: "+diffs[i],i===difficulty);
  drawButton(120,400,120,40,"Voltar",()=> gameState="menu");
}
