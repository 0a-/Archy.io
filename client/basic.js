TButler.code("svg",function(){
	var s = Snap(".svg");
	var r = 12;
	var c = s.circle(r,r,r);
	c.attr({
	    fill: "#000"
	});
	var lineHeight = 300;
	var w = 4;
	var l = s.rect(r-w/2,r*2,w,lineHeight);
	l.attr({
		fill:"#000"
	});
	var c2 = s.circle(r,lineHeight+r,r);
	c2.attr({
	    fill: "#000"
	});
	var $s = $(".svg");
	s.attr("width",r*2).attr("height",lineHeight+r*2);
});

TButler.code("button",function(){
	$(".button").hover(function(){
		$(this).children(".AwesomeButtonBackground").css("height","100%");
	},function(){
		$(this).children(".AwesomeButtonBackground").css("height","0%");
	});
});

TButler.process("home",["svg","button"]);