"use strict";

if(window.console == undefined) {
	window.console = {log: function(s) { }};
}

function dir(ob) {
  out = [];
  for (var attr in ob) {
    out.push(attr);
  }
  out.sort();
  return out;
}

function range(n) {
  var r = [];
  for(var i=0; i<n; i++) 
     r.push(i);
  return r;
}

if (typeof Object.create !== 'function') {
  Object.create = function(o) {
      var F = function() {};
        F.prototype = o;
        return new F();
    };
}

Object.make = function(obj, d) {
  var newObj = Object.create(obj);
  $.each(d, function(index, value) {
    newObj[index] = value;
  });
  return newObj;
}

Object.clone = function(obj) {
 var target = {};
 for (var i in obj) {
  if (obj.hasOwnProperty(i)) {
   target[i] = obj[i];
  }
 }
 return target;
}


Object.size = function(obj) {
    var size = 0, key;
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

Object.keys = function(obj) {
    var keys = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) keys.push(key);
    }
    return keys;  
};

Object.values = function(obj) {
    var keys = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) keys.push(obj[key]);
    }
    return keys;
}

Object.truekeys = function(obj) {
    var keys = [];
    for (var key in obj) {
        if (obj[key]) keys.push(key);
    }
    return keys;
}

var log = function() {
  var txt = [];
  var LogSize = 20;
  return function(s) {
    if(console) {
      console.log(s);
    }
    txt.push(s);
    var lg = $('#log');
    lg.empty();
    for(var i=Math.max(0, txt.length-LogSize); i<txt.length; i++)
      lg.append('<li>'+txt[i]+'</li>');
  };
}();

var logonce = function() {
  var mem = {};
  return function(s) {
    if(s in mem) {}
    else {
      log(s);
      mem[s] = true;
    }
  };
}();

function loadImage(name) {
      var img = new Image();
      img.src = 'images/'+name+".png";
      if(!img) {
        log('failed loading image');
      }
      return img;
}

function fixAng(a) {
	var ang = a;
	while(ang > 2*Math.PI) ang -= 2*Math.PI;
	while(ang < 0) ang += 2*Math.PI;
	return ang;
}

function zfill(n, v, optC) {
	var s = n+'';
	var c = optC || '0'; 
	for(var i=s.length; i<v; i++) {
		s = c + s;
	}
	return s;
}

function sfill(n, v) {
}

var img_names = ['background', 'blue germ', 'math', 'multiplier', 'orange germ', 'pandemonium',  'projectile', 'purple germ', 'red germ', 'sprayer', 'virus', 'yellow germ', 'checkmark'];
var Img = {};
var germs = ['blue germ', 'red germ', 'yellow germ', 'purple germ'];
var specgerms = ['pandemonium', 'virus', 'multiplier'];
var snd_names = ['hairspray', 'drill', 'pt'];
var nkills = 0;
var timeElapsed = 0;
var op = '-';
var but_names = ['all', 'allhi', 'clearall', 'clearallhi', 'dare', 'darehi', 'play', 'playagain', 'playagainhi', 'playhi', 'print', 'printhi'];
var buttonImg = [];
var imgpage_names = ['dare', 'score', 'start'];

function initializeImages() {
  for(var im in img_names) {
    Img[img_names[im]] = loadImage(img_names[im]);
  }
  if(navigator.userAgent.indexOf('Safari')) {
	for(var i in but_names) {
	    var im = new Image();
		im.src = 'button/'+but_names[i]+'.png';
		buttonImg.push(im);
	}
	for(var i in imgpage_names) {
	    var im = new Image();
		im.src = 'imgpages/'+imgpage_names[i]+'.png';
		buttonImg.push(im);
	}
  }  
}
var Snd = {};
function initializeSounds() {
  if(!Audio) {
	if(navigator.userAgent.indexOf('Safari'))
		alert('Newest version of quicktime is needed for sound, sound is disabled.');
	else
		alert('Sound is disabled for unknown reason');
	Audio = function(s) {
		 
	}
	Audio.prototype.canPlayType = function(s) {
		return s === 'audio/mp3';
	}
	
  }
  for(var i in snd_names) {
    var snd = new Audio('');
	if(snd.canPlayType('audio/mp3') !== '')
		snd.src = 'sounds/'+snd_names[i]+'.mp3';
	else if (snd.canPlayType('audio/ogg') !== '') {
		snd.src = 'sounds/'+snd_names[i]+'.ogg';
	}
	Snd[snd_names[i]] = snd;
	console.log('loaded '+snd.src);
  }
}

function randItem(lst) {
	return lst[Math.floor(Math.random() * lst.length)];
}

function putText(ctx, text, x, y, strokest, fillst) {
	ctx.lineWidth = 1.0;
	ctx.fillStyle     = fillst || '#002BA0';
	ctx.fillText(text, x+1, y+1);
	ctx.strokeStyle     = strokest || '#FF0000';
	ctx.strokeText(text, x+1, y+1);
}

function drawText(ctx, text, x, y) {
	var em = 16;
	var w = ctx.measureText(text);
	//console.log('w'+w);
	drawBox(ctx, x, y-em-12, w.width+8, em+16);
	putText(ctx, text, x+4, y-4);
}

function drawBox(ctx, x1, y1, x2, y2) {
    ctx.fillStyle = '#fff';
	ctx.fillRect(x1, y1, x2, y2);
	ctx.fillStyle	= '#000';
	ctx.lineWidth = 2.0;
	ctx.strokeRect(x1, y1, x2, y2);
}

function textbox(ctx, text, x, y, ema) {
	var em = ema || 20;
	drawBox(ctx, x, y, text.length*em, em-2+em);
	drawText(ctx, text, 4, 4+em);
}

function centerText(ctx, text, ema) {
	var em = ema || 20;
	drawText(ctx, text, Img['background'].width/2 - text.length * em / 2, Img['background'].height/2);
}

function muteSound(_val) {
	console.log('muteSound is called '+_val+' '+Button.set['mute'] === 1);
	var val = _val || Button.set['mute'] === 1;
	for(var snd in Snd) {
		Snd[snd].muted = val;
	}
}

function stopSound() {
    console.log('stopSound is called');
	for(var snd in Snd) {
		Snd[snd].currentTime = Snd[snd].duration;
	}
}
/*
function soundbar() {
	var $newelt = $('<ol></ol>');
	for(var i=0; i<Snd.length; i++) {
		var onc = 
		var $li = $('<li><a onclick="">Load '+snd_names[i]+'</a></li>');
	}
}*/

var circleArea = {
  initialize: function() {
     
    this.buffIndex = 0;
    	
	var $canv = $('<div class="cc">  <canvas id="gamearea" style="width:100%; height:100%;"></canvas></div>');
	var $canv2 = $('<div class="cc"> <canvas id="gamearea2" style="visibility: hidden; width:100%; height:100%;"></canvas></div>');
	
	$('#imgpage').empty();
	$('#imgpage').append($canv);
	$('#imgpage').append($canv2);
    
	this.canv = [];
    this.canv.push(document.getElementById('gamearea'));
    this.canv.push(document.getElementById('gamearea2'));

    this.canvCtx = [];
    this.canvCtx.push(this.canv[0].getContext('2d'));
    this.canvCtx.push(this.canv[1].getContext('2d'));
	  
    this.canv[0].width = 636;
    this.canv[0].height = 448;
    this.canv[1].width = 636;
    this.canv[1].height = 448;
	var ga = $('#gameareas1');
	console.log('gm'+ga.width());
    // this.canv[0].width = ga.width();
    // this.canv[0].height = ga.height();
    // this.canv[1].width = ga.width();
    // this.canv[1].height = ga.height();
	
	var d;
	
	this.width = this.canv[0].width;
    this.height = this.canv[0].height;
	
	var cx;
	var cy;
	
	function updateCoords() {
		var d = setUpScreen();
		cx = d['cx'];
		cy = d['cy'];
		paused = Button.set['pause'] === 1;
		$('#imgpage').css({left: d['x'], top: d['y']});
		console.log($('#imgpage').offset());
		$('div.cc').each(function() {
			console.log(d);
			$(this).css({left:d['x'], top:d['y'], 
			  width:Img['background'].width*cx, 
			  height:Img['background'].height*cy,
			  position: 'absolute'});
		});
		$('#up').click(function(evt) {
			barClick('up');
			updateCoords();
		});
		$('#mute').click(function(evt) {
			barClick('mute');
			muteSound();
		});		
		$('#pause').click(function(evt) {
			barClick('pause');
			paused = Button.set['pause'] === 1;
		});
		$('#npad').remove();
		var numpad = $('<div id="npad"></div>');
		numpad.css({'position':'absolute', 'left':d['x'], 'top':d['y']});
		var numImg = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'x'];
		var numsize = Img['background'].height / numImg.length * 0.99;
		for(var i in numImg) {
			var k = numImg[i];
			var newu = $('<img/>', {
				'id':k,
				'class': 'numkey',
				'src':'numpad/'+k+'.png',
				'z-index':12
			});
			numpad.append(newu);
			newu.css({
				'position':'absolute',
				'left':0,
				'height':(numsize*0.1)+'px',
				'width':(numsize*0.1)+'px',
				'top':numsize*i
			});
			
		}

		$('#imgpage').append(numpad);
		$('img.numkey').hover(function() {
			$(this).attr('src', 'numpad/'+$(this).attr('id')+'hi.png');
		}, function() {
			$(this).attr('src', 'numpad/'+$(this).attr('id')+'.png');
		});
		expandAll(cx, cy, 'img');
	}
	updateCoords();

	var spinCanv = document.getElementById('spinner');
	spinCanv.width  = 400;
	spinCanv.height =  400;
	var spinCtx = spinCanv.getContext('2d');
    var sprayCenter = [98, 36];
	var sprayEnd    = [0, 43];
	var sprayImgAng = 3.2129001183750834;
	
    var ctx = this.canvCtx[0];
    var t = 0;
    var maxt = 10;
    var sel = 0;
    
    var that = this;
	
	var mousex = 0;
	var mousey = 0;

	var curAngle = 0.0;
	
	var Faceup = 3;
	var Facedown = 0;
	var Faceleft = 1;
	var Faceright = 2;
	var catchPause = false;

	var npc = [{'facing':Faceleft, 't':0, 'target':[0], 'x':100, 'y':208, 'chara':'blue germ'}];
	var npcmaxt = 12;
	var tables = [];
	var tablepoint = [[272, 283], [213, 423], [401, 361], [529, 287], [583, 427]];

	var mode = 'play';
	var selectedTable = -1;
	var shields = 7;
	var userans = '';
	var possibleAngles = 35;
	var angle2enemy = {};
	var angle2lazer = {};
	var level = 1;
    var sprayx = Img['background'].width / 2; //- sprayCenter[0];
    var sprayy = Img['background'].height / 2; // - sprayCenter[1];
	var mathx = sprayx;
	var mathy = sprayy;
	var targetEnemy = null;
	var maxEnemyT = 30;
	var kickbackT = 0;
	var maxkickbackT = 10;
	var shakeT = 0;
	var maxShakeT = 20;
	var UpdateMillis = 45;
	var timelimit = 3 * 60;
	//timelimit = 3;
	var tToSeconds = UpdateMillis / 1000.0
	var modes = [];
	var t = 0;
	var stopt = 0;
	var paused = false;
	var locked = false;
	var muted = false;
	var catchClick = false;
	var topQ = Object.truekeys(allowedNum[0]);
	var botQ = Object.truekeys(allowedNum[1]);
	var topQt = Object.truekeys(allowedNum[0]);
	var botQt = Object.truekeys(allowedNum[1]);

	function getItem(d, allNum) {
		var choice = randItem(d.curl);
		
		var newl = [];
		for(var i in d.curl) {
			if(d.curl[i] != choice)
				newl.push(d.curl[i]);
		}
		d.curl = newl;
		if(d.curl.length === 0)
			d.curl = Object.truekeys(allNum);
		return choice;
	}
		
	if(topQ === []) topQ = [1];
	if(botQ === []) botQ = [1];
	
	topQ = {'curl':topQ};
	botQ = {'curl':botQ};
	nkills = 0;
	
	//sprayx -= spinCanv.width/2;
	//sprayy -= spinCanv.height/2;

	var mousecoords = [0, 0];
	
	function generateEnemy(dista, disallowSpec) {		
		var chara;
		if(Math.random() < 0.8 || disallowSpec)
			chara = germs[Math.floor(Math.random()*germs.length)];
		else {
			chara = randItem(specgerms);
		}
		var speed = Math.random() * 0.4 + level*0.2;
		var dist = dista || 350;
		var obj = {};
		var angle = Math.floor(Math.random() * possibleAngles);
		while(angle < possibleAngles) {			
			if(!angle2enemy[angle]) {
				angle2enemy[angle] = {'chara': chara, 'speed':speed, 'dist':dist, 't':0};
				break;
			}
			angle++;
		}
	}
	
	function killEnemy(enemy, ang) {
		if(enemy.chara === 'pandemonium') {
			for(var ene in angle2enemy) {
				if(ene !== ang) {
					if(angle2enemy[ene].t == 0)
						angle2enemy[ene].t = maxEnemyT;
				}
			}
		}
		else if(enemy.chara === 'virus') {
			stopt = parseInt(5/tToSeconds);
		}
		else if(enemy.chara === 'multiplier') {
			for(var i=0; i<5; i++) generateEnemy(Math.max(enemy.dist, 125), true);
			stopt = parseInt(15/tToSeconds);
		}
		else {
			
		}
		nkills++;
		delete angle2enemy[ang];
	}
	
	function enemyCoords(i, ang) {
		var rad = parseInt(ang)/possibleAngles*2*Math.PI;
		var im = Img[i.chara];
		var x = Math.cos(rad) * i.dist + Img['background'].width/2;
		var y = Math.sin(rad) * i.dist + Img['background'].height/2;
		return [x, y];
	}
	
	function enemyPoints(i, ang) {
		var coords = enemyCoords(i, ang)
		return {x1:coords[0] - Img[i.chara].width/2,
		        x2:coords[0] + Img[i.chara].width/2,
				y1:coords[1] - Img[i.chara].height/2,
				y2:coords[1] + Img[i.chara].height/2};
	}
	
	function generateQuestion() {
		var ops = ['+', '-', '*', '/'];
		//var op = ops[Math.floor(Math.random()*ops.length)];
		//var op = '*';
		var op = Global.op;
		if(op === '+' || op === '-') {
			var top = getItem(topQ, allowedNum[0]);
			var bot = getItem(botQ, allowedNum[1]);
			if(op === '-') {
				var mx = Math.max(top, bot);
				var mn = Math.min(top, bot);
				top = mx;
				bot = mn;
			}
			var ans = eval(''+top+op+bot);
		}
		if(op === '*') {
			var top = getItem(topQ, allowedNum[0]);
			var bot = getItem(botQ, allowedNum[1]);
			var ans = bot*top;
		}
		if(op === '/') {
			var bot = getItem(topQ, allowedNum[0]);
			var ans = getItem(botQ, allowedNum[1]);
			var top = bot * ans;
		}
		console.log(topQ, botQ);
		return {'top':top, 'bot':bot, 'op':op, 'ans':ans};		
	}
	
	var question = null;
	this.question = question;
	
	/*
	$(document).mousemove(function(e) {
		mousex = e.pageX;
		mousey = e.pageY;
	});*/
	
	var nframe = 4;
	function drawNpc(ctx, npc) {
		var im = Img[npc.chara];

		ctx.drawImage(im, 0, 0, im.width, im.height, npc.x*cx, npc.y*cy, w*cx, h*cy);
	}
	
	// $(window).resize(function() {
		// for(canv in that.canv) {
			// that.canv[canv].width = $(window).width();
			// that.canv[canv].height = $(window).height();
		// }
		// this.width = that.canv[0].width;
		// this.height = that.canv[0].height;
		// cx = this.width / Img['background'].width;
		// cy = this.height / Img['background'].height;

	// });
	
	$('div.cc').click(function(e) {
		if(catchClick) {
			catchClick = false;
			return;
		}
		var x = e.pageX;
		var y = e.pageY;
		var $ga = $('#gamearea');
		var off = $ga.offset();
		mousecoords = [x/$ga.width()*that.canv[0].width - off.left, y/$ga.height()*that.canv[1].height - off.top];
		var x = mousecoords[0];
		var y = mousecoords[1];
		// console.log('mouse'+mousecoords);
		// console.log('rawm'+[e.pageX, e.pageY]);
		// console.log('bg'+[Img['background'].width,Img['background'].height]);
		// console.log('ga'+[$('#gameareas1').width(),$('#gameareas1').height()]);
		// console.log('w'+[window.innerWidth, window.innerHeight]);
		// console.log('c'+[that.canv[0].width, that.canv[1].height]);
		var abs = Math.abs;
		function between(low, v, hi) {
			return v >= low && v <= hi;
		}
		curAngle = Math.atan2(y-sprayy, x-sprayx) + sprayImgAng;

		function checkCoords(enemy, enemyAng) {
			var pnts = enemyPoints(enemy, enemyAng);
			console.log(pnts.x1+'-'+x+'-'+pnts.x2);
			return between(pnts.x1, x, pnts.x2) && between(pnts.y1, y, pnts.y2);
		}
		if(!question) {
			var anglei = Math.floor((fixAng(curAngle-sprayImgAng))/(2*Math.PI)*possibleAngles);
			console.log('ai'+anglei);
			var enemy = null;
			var enemyAng = null;
			for(var r=0; r<16; r++) {
				enemyAng = (anglei+r)%possibleAngles;
				enemy = angle2enemy[enemyAng];
				if(enemy && checkCoords(enemy, enemyAng)) break;
				enemyAng = (anglei-r)%possibleAngles;
				enemy = angle2enemy[enemyAng];
				if(enemy && checkCoords(enemy, enemyAng)) break;
			}
			if(enemy) {
				var coords = enemyCoords(enemy, enemyAng);
				var dx = coords[0] - x;
				var dy = coords[1] - y;
				console.log('distance'+Math.sqrt(dx*dx+dy*dy)+' r'+Img[enemy.chara].width);
				if(dx*dx + dy*dy < Img[enemy.chara].width*Img[enemy.chara].height) {
					question = generateQuestion();
					targetEnemy = enemy;
				}
			}
		}
		
		/*
		selectedTable = -1;
		for(var i=0; i<tables.length; i++) {
			var x1 = tables[i].x;
			var x2 = tables[i].x + Img['tablebase'].width;
			var y1 = tables[i].y - Img['tabletop'].height;
			var y2 = tables[i].y + Img['tablebase'].height;
			if(between(x1, x, x2) && between(y1, y, y2)) {
				selectedTable = i;
				console.log(selectedTable);
				that.selectedTable = selectedTable;
				break;
			}
		}
		*/
	});
	
	function dismissQuestion() {
		userans = '';
		question = null;
	}
	
	function getSeconds() {
		return parseInt(UpdateMillis/1000.0 * t);
	}
	
	$(document).keypress(function(e) {

		/*
		if(e.keyCode === 8) { // backspace
			userans = userans.substr(0, userans.length-1);
		}*/
		if(e.keyCode === 13)
			dokey('ent');
		else
			dokey(String.fromCharCode(e.charCode));
		
	});
	
	function dokey(ch) {
		if(!question) return;
		if(parseInt(ch) || ch === '-' || ch === '0') {
			userans = userans + ch;
			if(parseInt(userans) === parseInt(question.ans)) {
				targetEnemy.t = maxEnemyT;
				kickbackT = maxkickbackT;
				dismissQuestion();
				Snd['hairspray'].play();
			}
			if(userans.length >= 3) {			
				dismissQuestion(); 
			}
		}
		if(ch === 'ent') dismissQuestion();
	}
	
	$(document).keydown(function(e) {
		if(e.keyCode === 8) { // backspace
			userans = userans.substr(0, userans.length-1);
			if(e.preventDefault) e.preventDefault();
			if(e.stopPropagation()) e.stopPropagation();
		}
	});
	
	$('img.numkey').click(function() {
		var ch = $(this).attr('id');
		if(ch === 'x')
			userans = userans.substr(0, userans.length-1);
		else
			dokey(ch);
	});
	
	function drawPropImage(im, x, y) {
		//var cx = 1.0;
		//var cy = 1.0;
		ctx.drawImage(im, x, y);
		//ctx.drawImage(im, 0, 0, im.width, im.height, x*cx, y*cy, im.width*cx, im.height*cy);
	}
	//var drawPropImage;
    
	this.drawfunction = function(ctx) {
	  var bgmusic = Snd['pt'];
	  
	  
	  if(bgmusic.duration - bgmusic.currentTime < 0.1) {
		bgmusic.load();		
	  }
	  if(bgmusic.currentTime == 0) {
	  	bgmusic.play();
	  }
	  
	  //bgmusic.play();
	  //console.log('bgmusic.c'+bgmusic.currentTime+' '+bgmusic.duration);
	  drawPropImage(Img['background'], 0, 0);
	  	  
	  //$('#pos').html(x+' '+y);
	  
	  //drawPropImage(Img['sprayer'], x, y);
	  
	  for(var ang in angle2enemy) {
		var i = angle2enemy[ang];
		//var rad = parseInt(ang)/possibleAngles*2*Math.PI;
		
		if(!Img[i.chara]) {
				console.log('img is'+i.chara);
				continue;
		}
		var im = Img[i.chara];
		var coords = enemyCoords(i, ang);
		var x = coords[0] - im.width/2;
		var y = coords[1] - im.height/2;
		//var x = Math.cos(rad) * i.dist - im.width/2 + Img['background'].width/2;
		//var y = Math.sin(rad) * i.dist - im.height/2 + Img['background'].height/2;
		if(i.t == 0) {
			if(stopt === 0)
				i.dist -= i.speed;
		}
		else {
			i.t--;
			
			if(i.t == 0) {
				killEnemy(angle2enemy[ang], ang);
			}
			var sx = sprayx;
			var sy = sprayy;
			//var dx = i.t / maxEnemyT * (sx-x);
			//var dy = i.t / maxEnemyT * (sy-y);

			//drawPropImage(Img['projectile'], sx+dx, sy+dy);
			ctx.beginPath();
			ctx.lineWidth = Math.sin(Math.PI*i.t/maxEnemyT)*10;
			ctx.moveTo(sx*cx, sy*cy);
			ctx.lineTo(coords[0]*cx, coords[1]*cy);
			ctx.strokeStyle = "#00C000"; // line color
			ctx.stroke();
			ctx.globalAlpha = i.t / maxEnemyT;
		}
		drawPropImage(im, x, y);
					ctx.globalAlpha = 1.0;

		if(i.dist <= 5) {
			if(targetEnemy === angle2enemy[ang])
				dismissQuestion();
			delete angle2enemy[ang];
			
			shields -= 1;
			nkills = Math.max(nkills - 1, 0);
			shakeT = maxShakeT;
			Snd['drill'].play();
			/*
			if(shields <= 0) {
				locked = true;
				switchPage('score', getSeconds());
			}*/
			continue;
		}
	  }
	  
	  spinCtx.clearRect(0, 0, spinCanv.width, spinCanv.height);
	  spinCtx.save();
	  spinCtx.translate(sprayCenter[0]+spinCanv.width/2, sprayCenter[1]+spinCanv.height/2);
	  spinCtx.rotate(curAngle);
	  spinCtx.translate(-(sprayCenter[0]+spinCanv.width/2), -(sprayCenter[1]+spinCanv.height/2));
	  spinCtx.drawImage(Img['sprayer'], spinCanv.width/2, spinCanv.height/2);
	  spinCtx.rotate(-curAngle);
	  spinCtx.restore();
	  var km = Math.sin(kickbackT/maxkickbackT*Math.PI)*30;
	  var kx = Math.cos(curAngle)*km;
	  var ky = Math.sin(curAngle)*km;
	  
	  var shakex = (shakeT>0) ? Math.random(20)*cx : 0;
	  var shakey = (shakeT>0) ? Math.random(20)*cy : 0;
	  kx += shakex;
	  ky += shakey;
	  drawPropImage(spinCanv, sprayx-spinCanv.width/2-sprayCenter[0]+kx, sprayy-spinCanv.height/2-sprayCenter[1]+ky);	  
	  
	  for(var ang in angle2lazer) {
	   
	  }
	  // if(mousecoords !== []) {

	  // }
	  
	  
	  if(question) {	  
		  drawPropImage(Img['math'], mathx, mathy);
		  
		  var em = 30;
		  
		  if(navigator.userAgent.indexOf('Safari'))
			ctx.font = em+'pt Courier';
		  else
			ctx.font = 'bold '+em+"pt Courier";
		  ctx.fillStyle = '#ffffff';
		  var showchar = {'+':'+', '-':'-', '*':String.fromCharCode('0215'), '/':String.fromCharCode('0247')};
		  var bottom = showchar[question.op] + zfill(question.bot, 2, ' ');
		  var tops = zfill(question.top, 3, ' ');
		  if(tops.length == 1) {
			tops = ' '+tops;
		  }
		  var x = (mathx+30)*cx;
		  putText(ctx, tops, x, (mathy+em)*cy, '#fff', '#00f');
		  putText(ctx, bottom, x, (mathy+em*2)*cy, '#fff', '#00f');
		  
		  ctx.fillStyle = '#000000';
		  ctx.fillText(userans, x, (mathy+em*3.9)*cy);
		}
	}
	//that.drawfunction(ctx);

    that.interval = setInterval(function() {
	
	  if(paused || locked) {
		ctx.globalAlpha = 0.1;
		ctx.fillStyle = '#555';
		ctx.fillRect(0, 0, that.canv[0].width, that.canv[1].height);
		return;
	  }
	  if(stopt === 0) {
		  if(t % 120 == 0) generateEnemy();
		  t++;
	  }
	  
	  if(kickbackT>0) kickbackT--;
	  if(shakeT>0)    shakeT--;
	  
	  
      //that.buffIndex = 1 - that.buffIndex;
  
      ctx = that.canvCtx[that.buffIndex];

	  that.drawfunction(ctx);
	  var em = 25;
	  var seconds =  parseInt(UpdateMillis/1000.0 * t);
	  var sec = timelimit - seconds;
	  if(sec === 0) {
		ctx.font = 'bold '+em+"pt courier new";
		ctx.fillStyle = '#ffffff';		
		centerText(ctx, 'Time Up');
		locked = true;
		stopSound();
		setTimeout(function() {
			switchPage('score', sec);
		}, 200);
		return;
	  }
	  //drawBox(ctx, Img['background'].width - 8*em, 2, 7*em, 2+4*em)
	  
	  var timetext = 'Time '+parseInt(sec/60)+':'+zfill(sec%60,2);
	  var scoretext = 'Score '+nkills;
	  ctx.font = 'bold 32px courier';
	  drawText(ctx, timetext, Img['background'].width/2 - ctx.measureText(timetext).width/2, em+8);
	  //drawText(ctx, 'Life '+zfill(shields, 2), Img['background'].width - 7*16-8, Img['background'].height-12);
      drawText(ctx, scoretext, Img['background'].width/2 - ctx.measureText(scoretext).width/2, Img['background'].height-12);
	  //ctx.clearRect (0, 0, Img['background'].width, Img['background'].height);
      //that.canv[1-that.buffIndex].style.visibility='hidden';
	  //that.canv[that.buffIndex].style.visibility='visible';

	  if(stopt > 0) {
	  	stopt--;
		var text = 'Stopped for:'+parseInt(stopt*tToSeconds);
		drawBox(ctx, 2, 2, text.length*em, em-2+em);
		ctx.fillText(text, 4, 4+em);
	  }
    }, UpdateMillis);
  }
};

function randomChoice(seq) {
  var choices = Object.keys(seq);
  return seq[choices[Math.floor(Math.random() * Object.size(seq))]];
}
initializeImages();
initializeSounds();

var imgpage = {
	'dare': {'dare': [363, 383, sendEmail]},
	'score':{'print': [108, 286, toPrint], 'dare': [332, 286, toDare], 'playagain': [180, 151, function() { switchPage('start'); }]},
	'start':{'play':[246, 351, startPlay], 'clearall_0':[175, 351, null],
	         'clearall_1':[175+297, 351, null], 'all_0':[147, 351, null],
			 'all_1':[147+297, 351, null]}
};

function toScore() {
	switchPage('score');
}

function toDare() {
	switchPage('dare');
}

function toPrint() {
	window.print();
}

function sendEmail() {
	var form = $('#dareform');
	var body =  "I solved "+nkills+" addition problems in 3 minutes on Numberlandia.  I dare you to solve more than me!%0D%0D";
	body += $('#comment').val();
	body += '%0D%0DRegards,%0D';
	body += $('#name').val();
	body += '%0D%0D%0D';
	
	var bod='&body='+body;
	var subj="?subject=I dare you";
	form.attr('action', 'mailto:'+$('#email').val()+subj+bod);
	form.submit();
}

function butImg(but) {
	return Button.choice[but][Button.set[but]];
}

function gameButtons(val) {
	var hidebut = ['pause', 'mute'];
	for(var hb in hidebut) {
		$('#'+hb).css({visibility:val});
	}
}

function setUpScreen(_h) {
	var barh = 64;
	var x, y, cx, cy;
	if(Button.set['up']) {
		x = 0;
		y = 0;
		cx = (window.innerWidth - 18) / Img['background'].width;
		cy = (window.innerHeight - 18) / (Img['background'].height+barh);
	}
	else {
		x = Math.max(window.innerWidth/2-Img['background'].width/2, 0);
		y = 0;
		cx = 1.0;
		cy = 1.0;
	}
	var h = _h || Img['background'].height;
	console.log('h'+[Img['background'].height,h,_h]);
	var barx = x;
	var bary = y + h*cy;
	var $bar = $('#bar');
	var bgx = x;
	var bgy = y;
	$bar.empty();
	var butimg = {};
	for(var but in Button.set) {
		console.log(but);
		butimg[but] = $('<img src="'+'bar/'+butImg(but)+'.png'+'" class="barbutton" id="'+but+'"></img>');		
		butimg[but].css({position: 'absolute', left:bgx+Button.loc[but]*cx, top:bary, 'z-index':4});
		$bar.append(butimg[but]);
	}
	var $barbg = $('<img src="bar/bg.png"></img>');
	$barbg.css({position: 'absolute', left:bgx, top:bary, 'z-index':3});
	$bar.append($barbg);
	$('img.barbutton').hover(function() {
		var but = $(this).attr('id');
		$(this).attr('src', 'bar/'+butImg(but)+'hi.png');
	},
	function() { 
		var but = $(this).attr('id');
		$(this).attr('src', 'bar/'+butImg(but)+'.png');	
	});
	console.log([x, y]);
	return {'cx': cx, 'cy':cy, 'x':x, 'y':y, 'bot':bary};
}

function expandAll(cx, cy, _what) {
	var what = _what || 'img';

	/*var func;
	if($(this).attr('id') === 'bg')
		func = function(f) { alert('bg'); f(); };
	else*/
	var	func = function(f) { $(this).load(f) };
	
	if(Button.set['up']) {
		$(what).each(function() {
			if($(this).attr('id') === 'bg') {
				$(this).css({width: this.naturalWidth*cx+'px',
						     height:this.naturalHeight*cy+'px'});
				return;
			}
			$(this).load(function() {			
				$(this).css({width: this.naturalWidth*cx+'px',
						     height:this.naturalHeight*cy+'px'});
			});
		});
	}
	else {
		$(what).each(function() {
			if($(this).attr('id') === 'bg') {
				$(this).css({width: this.naturalWidth+'px',
						     height:this.naturalHeight+'px'});
				return;
			}
			$(this).load(function() {
				$(this).css({width:this.naturalWidth+'px',
							 height:this.naturalHeight+'px'});
			});
		});
	}
}


function barClick(but) {
	Button.set[but] = 1 - Button.set[but];
	$(this).attr('src', 'bar/'+butImg(but)+'.png');	
}

function switchPage(pageName, sec) {
	
	var page = $('#imgpage');
	//$('#hud').css({visibility: 'hidden'});
	$('img.imgbutton').unbind('hover');
	$(window).unbind('resize');
	$(window).resize(function() {
		switchPage(pageName, sec);
	});
	
	console.log('switching page');
	
	if(circleArea.interval)
		clearInterval(circleArea.interval);
	page.empty();
	var $bg = '<img src="imgpages/'+pageName+'.png" id="bg"/>';
	page.append($bg);
	var cx, cy, x, y;
	$('#bg').load(function() {
		Button.loc['up'] = $('#bg').width() - 64;
		var d = setUpScreen($('#bg').height());
		var bgx = d['x'];
		var bgy = d['y'];
		var cx = d['cx'];
		var cy = d['cy'];
		gameButtons('hidden');
		
		
		$('#bg').css({'position':'absolute', 'left':bgx, 'top':bgy});
		
		$('#up').click(function(e) {
			var but = $(this).attr('id');
			barClick(but);
			switchPage(pageName, sec);
		});
		
		$('#pause').click(function() { barClick($(this).attr('id'));});
		$('#mute').click(function() { 
			barClick($(this).attr('id'));
			muteSound();
		});
		
		var butimg = {};
		
		for(var button in imgpage[pageName]) {
			var coords = imgpage[pageName][button];
			//var $elt = $('<div class="imgbuttoncont" id="cont_'+button+'"></div>');
			
			var x = coords[0]*cx+bgx;
			var y = coords[1]*cy+bgy;
			
			$elt = $("<img id='"+button+"'class='imgbutton'/>")
			$elt.css({left: x+'px', top: y+'px'});
			
			//$elt.append( #elt);
			page.append($elt);
		}
		$('img.imgbutton').each(function() {
			var id  = $(this).attr('id').split('_')[0];
			$(this).attr('src', 'button/'+id+'.png');
		});
		$('img.imgbutton').hover(function() {
			var id  = $(this).attr('id').split('_')[0];
			$(this).attr('src', 'button/'+id+'hi.png');
		}, function() {
			var id  = $(this).attr('id').split('_')[0];
			$(this).attr('src', 'button/'+id+'.png');
		});
		$('img.imgbutton').click(function() {

			var id = $(this).attr('id');
			var arg1 = $(this).attr('id').split('_')[1];
			
			imgpage[pageName][id][2](arg1);
		});
		if(pageName === 'dare') {
			var $elt = $('<div></div>');
			$elt.css({position: 'fixed', left: bgx+120*cx, top:bgy+135*cy, width:'445', 'z-index': 4});
			var $form = $('<form id="dareform" method="post"></form>');
			var fields = ['Your name', 'Friend', 'Friend email'];
			var field2id = {'Your name':'name', 'Friend':'friend', 'Friend email':'email'};
			var $tb = $("<table></table>");
			for(var i in fields) {
				var field = fields[i];
				var id = field2id[field];
				var $field = $('<tr><td align="right"><span class="bigfont">'+field+':</div></td><td><input type="text" name="'+id+'" id="'+id+'"/></td></tr>');
				$tb.append($field);
			}
			var $field = $('<tr><td align="right"><span class="bigfont">Add a comment:</div></td><td><textarea id="comment" name="comment" rows="5"></textarea></td></tr>');
			$tb.append($field);
			$form.append($tb);		
			page.append($elt);
			//var nkills = 10;
			var text = 'I scored '+zfill(nkills, 3)+' points!';
			var text2 = 'in <u>3</u> minutes';
			var $newelt = $('<div>'+text+'</div>');
			var $newelt2 = $('<div>'+text2+'</div>');
			var fontpt = 38;
			$newelt.css({ 
				'font-family': "'Arial Black', Gadget, sans-serif",
				'position': 'absolute',
				'color': '#0029a0',
				'font-size': fontpt+'pt',
				'text-shadow': '0 -2px #f00, 2px 0 #f00, 0 2px #f00, -2px 0 #f00',
				'z-index': '4'
			});
			$newelt2.css({ 
				'font-family': "'Arial Black', Gadget, sans-serif",
				'position': 'absolute',
				'color': '#0029a0',
				'font-size': fontpt/2+'pt',
				'text-shadow': '0 -2px #f00, 2px 0 #f00, 0 2px #f00, -2px 0 #f00',
				'z-index': '4'
			});
			page.append($elt);
			page.append($newelt);
			page.append($newelt2);
			$elt.append($form);		
			var x = Img['background'].width/2 * 0.95 * cx - $newelt.width()/2 + bgx;
			var x2= Img['background'].width/2 * 0.95 * cx - $newelt2.width()/2 + bgx;
			$newelt.css({left:x+'px', top:bgy+32*cy+'px'});
			$newelt2.css({left:x2+'px', top:bgy+92*cy+'px'});		

			
		}
		else if(pageName === 'score') {
			var text = 'Score '+zfill(nkills, 3);
			var $newelt = $('<div><b>'+text+'</b></div>');
			var fontpt = Img['background'].width / text.length;
			console.log('iw'+window.innerWidth+' px'+fontpt);
			$newelt.css({
				'font-family': "'Arial Black', Gadget, sans-serif",
				'color': '#0029a0',
				'text-shadow': '0 -2px #f00, 2px 0 #f00, 0 2px #f00, -2px 0 #f00',
				'position': 'absolute',
				'font-size': fontpt+'px',
				'z-index': '4'
			});
			page.append($newelt);
			var x = Img['background'].width/2 * cx - $newelt.width()/2 + bgx;
			console.log('vd'+$newelt.width()/2);
			
			$newelt.css({left:+x+'px', 
						 top: 40*cy+bgy+'px'});
		}
		else if(pageName === 'start') {
			
			window.allowedNum = [{}, {}];
			for(var pos=0; pos<2; pos++) {
				for(var ten=0; ten<2; ten++) {
					for(var one=1; one<=10; one++) {
						var n = ten*10 + one;
						//var $imcont = $('<div class="imgcheckcont"></div>');
						var $im = $('<div class="lol"><img src="images/checkmark.png" id="num_'+pos+'_'+n+'" class="checkimg" /></div>');
						//$imcont.append($im);
						var $num = $('<div class="imgcheckrow" id="n_'+pos+'_'+n+'"><p style="text-align: center;">'+zfill(n, 2, ' ')+'</p></div>');
						//$imcont.append($num);
						var x = (one*15+56+pos*296.0)*cx+bgx;
						var y = (ten*22+365)*cy+bgy;
						$im.css({top: y-2+'px', left: x+2+'px', position:'absolute'});
						$num.css({top: y+2+'px', left: x+'px', position:'absolute', 
						 width:Img['checkmark'].width*cx, 'font-size':'8pt', 'font':'courier'});
						page.append($im);
						page.append($num);
						if((Global.op === '+' || Global.op === '-') || n <= 10)
							allowedNum[pos][n] = true;
					}
				}
			}
			/*
			for(var i=0; i<2; i++) {
				var $clearB = $('<img></img>');
				$clearB.attr('id', 'clearall_'+i);
				$clearB.attr('class', 'startimgbutton');
			}
			var lst = ['#cont_clearall_0', '#cont_clearall_1'];
			for(var i in lst)
				$(lst[i]).css({width: '8%', height:'3.5%'});
			lst=['#cont_all_0', '#cont_all_1'];
			for(var i in lst)
				$(lst[i]).css({width: '4%', height:'3.5%'});*/
			var updateChecks = function() {
				$('img.checkimg').each(function() {
					var splt = $(this).attr('id').split('_');
					var pos = splt[1];
					console.log('pos'+pos);
					if(allowedNum[pos][splt[2]])$(this).attr('src', 'images/checkmark.png');
					else					    $(this).attr('src', 'images/uncheck.png');				
				});		
			}
			var clearall = function(id) {
				console.log('clearall'+id);
				var d = allowedNum[id];
				for(var key in d) {
					d[key] = false;
				}
				updateChecks();
			}
			var all = function(id) {
				console.log('all'+id);
				var d = allowedNum[id];
				for(var key in d) {
					d[key] = true;
				}
				updateChecks();
			}
			
			imgpage['start']['clearall_0'][2] = clearall;
			imgpage['start']['clearall_1'][2] = clearall;
			imgpage['start']['all_0'][2] = all;
			imgpage['start']['all_1'][2] = all;
						
			$('#num_1_20').one('load', function(evt) {
				evt.stopImmediatePropagation();
				updateChecks();
				
				var q = (navigator.appName === 'Microsoft Internet Explorer') ? 'img.checkimg' : 'div.imgcheckrow';
				
				$(q).click(function(evt) {
					if(!$(this))
						return;
					var spl = $(this).attr('id').split('_');
					var n = spl[2];
					var pos = spl[1];
					console.log(spl);
					allowedNum[pos][n] = !allowedNum[pos][n];
					var checkObj = (q === 'img.checkimg' ) ? $(this) : $('#num_'+spl[1]+'_'+spl[2]);
					//if(spl[0] ==='n') {
					//	checkObj = $('#num_'+spl[1]+'_'+spl[2]);
					//}
					console.log('lal');
					if(allowedNum[pos][n])	checkObj.attr('src', 'images/checkmark.png');
					else					checkObj.attr('src', 'images/uncheck.png');				
					
				});	
			});
		}		
		expandAll(cx, cy, 'img');
	});
}

var Button = {};

$(window).load(function() {
	var x = 64;
	Button.loc = {'pause':0, 'mute':x, 'up':Img['background'].width-64};
	Button.set = {};
	Button.visible = {};
	Button.img = {};
	Button.choice = {'up':['up', 'restore'],
			   'mute':['mute', 'sound'], 
			   'pause':['pause', 'play']};
	for(var but in Button.choice) {
		Button.set[but] = 0;
		Button.visible[but] = true;
	}

	switchPage('start');
});

function startPlay() {
	$('#imgpage').empty();
	$(document).unbind('click');
	$(document).unbind('hover');
	$(window).unbind('resize');
	//$('#hud').css({visibility: 'visible'});
	gameButtons('visible');
	//$(window).load(function() {
	  "use strict";  

	  //GameArea.initialize();
	  //GameArea.draw();
	  
	circleArea.initialize();
	//});
}