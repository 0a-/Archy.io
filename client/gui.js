var closure = function(){
    var paper, $paper;

    function snapReadyCreate($){
        this._ = $;
    }
    snapReadyCreate.prototype.$ = function(){
        return new archySnapWrap(paper[this._].apply(paper,arguments));
    }

    function archySnapWrap($){
        this._ = $;
    }

    var getDimension =  function(_){
        if(this.bbox===undefined){
            this.bbox = this._.getBBox();
        }
        return this.bbox[_];
    }

    archySnapWrap.prototype = {
        x: function(){
            return getDimension.call(this,"x");
        },
        y:function(){
            return getDimension.call(this,"y");
        },
        width: function(){
            return getDimension.call(this,"width");
        },
        height: function(){
            return getDimension.call(this,"height");
        },
        makeRect: function(bigger,arrayOfEles){
            bigger = bigger || 0;
            if(arrayOfEles !== undefined){
                //group them
                var array = [];
                arrayOfEles.forEach(function(e){
                    array.push(e._);
                });
                array.push(this._);
                var group = new archySnapWrap(paper.g.apply(paper,array));
                return group.makeRect(bigger);
            }
            this.rect = paper.rect(this.x() - bigger / 2, this.y() - bigger / 2, this.width() + bigger, this.height() + bigger);
            this.rect.attr({
                "fill-opacity":0
            });
            return this;
        },
        transform: function(m){
            return this._.attr({
                        transform: m
                    });
        },
        CLICK: function(fn){
            if(this.rect === undefined) this.makeRect();
            this.pointerize().click(fn);
        },
        DRAG : function(fn0,fn1,fn2){
            if(this.rect === undefined) this.makeRect();
            this.pointerize().drag(fn0,fn1,fn2);
        },
        pointerize : function() {
            console.log(this.rect);
            this.rect.node.style.cursor = "pointer";
            return this.rect;
        }
    }

    var index = 0,functions = [
        function($){
            paper= Snap($);
            ArchySVG.box = {
                width:function(){ return paper.node.offsetWidth },
                height:function(){ return paper.node.offsetHeight }
            };
            index++;
        },
        function($){
            if(typeof $ !== "string"){
                if($.constructor === archySnapWrap) return $;
                return new archySnapWrap($);
            }else{}
                return new snapReadyCreate($);
        }
    ];

    var ArchySVG = function($){
        return functions[index]($);
    };
    ArchySVG.paper = function(){
        return paper;
    }

    ArchySVG.load = function(string,callback){
        Snap.load(string,function(f){
            var object = f.select("path");
            paper.append(object);
            callback(new archySnapWrap(object));
        });
    }

return ArchySVG;
}




var initGUI1 = function(editor) {

    editor.setReadOnly(true);
    var typing = false,
        typeString = "";

    function typedown() {
        var n = 0;
        if (!typing) {
            var a = setInterval(function() {
                typing = true;
                editor.insert(typeString[n++]);
                if (typeString.length === n) {
                    typing = false;
                    typeString = ""; //empty string
                    clearInterval(a);
                }
            }, 50);
        }
    }

    var _editor = {
        createCollection : function(collectionName) {
            typeString += "DBButler.prepare(\""+collectionName+"\");\n";
            typedown();
        },
        deleteLine : function(n,t){
            t = t || 1;
            var a = 0;
                while(a<t){
                    editor.gotoLine(n, 0);
                    editor.removeToLineEnd();
                    editor.removeToLineEnd();
                    a++;
            }
        }
    }

    var input = $(".inputForCollectionText");
    input.focus(function() {
            $(this).select();
        });
    input.keypress(function(e) {
        if (((e.keyCode || e.which) == 13)) {
            input.blur();
        }
    });
    (function($){
        //helpers functions
        $._  = {
            appendTextfieldBeneath : function(object,x,y){
                input.addClass("inputBeneath");
                input.css({
                    top: y,
                    left: x
                });
                input.val("Collection");
                input.focus();
            },
            appendTextBeneath:function(object,x,y,word){
                var text = $("text").$(0, 0, word);
                text.transform("matrix(1,0,0,1," + (x + 45 - text.width() / 2) + "," + (y + 15) + ")");
                return text;
            },
            setObjectPosition : function(object,x,y){
                $.paper().append(object._);
                object.transform("matrix(1,0,0,1," + x + "," + y + ")");
            },
            finalizeCollectionObject: function(object,x,y,text){
                //manyToOne oneToMany icons
                x = x + object.width() + 15;
                y = y + 14;
                var oneToX =  $("circle").$(0, 0, 5);
                var line1 = $("line").$(-2, -4.6, 5, 0);
                var line2 = $("line").$(-5, 0, 5, 0);
                var line3 = $("line").$(-2, 4.6, 5, 0);
                [line1, line2, line3].forEach(function(ele) {
                    ele._.attr({
                        "stroke-width": "1",
                        stroke: "black"
                    });
                });
                var manyToX = line3.makeRect(0,[line1, line2]);
                manyToX.transform("matrix(0,0,0,0," + x + "," + (y + 18) + ")");
                oneToX.transform("matrix(0,0,0,0," + x + "," + y + ")");

                //hover
                var group = object.makeRect(0,[text]);
                var supergroup = group.makeRect(23,[manyToX,oneToX]);
                /*so that it is not blocked by supersupergroup */ group.rect.appendTo($.paper());
                supergroup.rect.hover(function(){
                    oneToX._.stop().animate({
                            transform: "matrix(1,0,0,1," + x + "," + y + ")"
                        },
                        500, mina.elastic);
                    manyToX._.stop().animate({
                            transform: "matrix(1,0,0,1," + x + "," + (y + 18) + ")"
                        },
                        500, mina.elastic);
                    }, function() {
                    oneToX._.stop().animate({
                            transform: "matrix(0,0,0,0," + x + "," + y + ")"
                        },
                        300, mina.easeout);
                    manyToX._.stop().animate({
                            transform: "matrix(0,0,0,0," + x + "," + (y + 18) + ")"
                        },
                        300, mina.easeout);
                });
                //drag (entire object)
                var supersupergroup = $.paper().g(supergroup._,supergroup.rect);
                var start_x = 0, start_y = 0;
                group.DRAG(function(dx, dy, x, y) {
                    supersupergroup.attr({
                        transform: "matrix(1,0,0,1," + (start_x + dx) + "," + (start_y + dy) + ")"
                    });
                }, function(){}, function(event) {
                    console.log(supersupergroup,supersupergroup.matrix);
                    start_x = supersupergroup.matrix.e;
                    start_y = supersupergroup.matrix.f;
                });
                //drag (oneToX)
                var line = $("line").$(10, 0, 0, 0);
                line.transform("matrix(1,0,0,1," + x + "," + (y + 18) + ")");
                oneToX.DRAG(
                    function(dx,dy,x,y,event){
                        line._.attr({
                            x1:dx,
                            y1:dy
                        });
                    },function(x,y,event){
                        //start
                    },function(event){
                        //end
                });
            },
            makePermuteFn: function(callback){ //create a closure with var a & b
                var a = 0, b = 0;
                return function(ele,bound){
                    var ele_x = 50 + (100) * a;
                    a++;
                    if (ele_x > bound.width()) {
                            a = 1;
                            b++;
                            ele_x = 50;
                        }
                    var ele_y = 20 + (40 + ele.height()) * b;
                    callback(ele,ele_x,ele_y);
                }
            }
        };

        $(".everything");
        $.load("cube.svg",function(object){
            var x = $.box.width() - object.width();
            var y = $.box.height() - object.height();
            //set object position
            object.transform("matrix(1,0,0,1," + x + "," + y + ")");
            var text = $("text").$(x, y, "create");
            text.transform("matrix(1,0,0,1," + (-text.width() - 10) + "," + (object.height() / 2 + 5) + ")");
            var permute = $._.makePermuteFn(function(obj,x,y){
                var below ={
                    x: x + (object.width() / 2) - 45,
                    y: y + object.height() + 5
                };
                $._.appendTextfieldBeneath(obj,below.x,below.y);
                $._.setObjectPosition(obj,x,y);
                input.one("blur",function(){
                    var collectionName = input.val();
                    input.removeClass("inputBeneath");
                    var text = $._.appendTextBeneath(obj,below.x,below.y,collectionName);
                    _editor.createCollection(collectionName);
                    $._.finalizeCollectionObject(obj,x,y,text);
                });

            });
            object.makeRect(0,[text]).CLICK(function(){
                var collection = $(object._.clone());
                permute(collection,$.box);
            });

        })
    })(closure());
}

TButler.code("editor", function() {
    AceEditor.instance("archy", {
        theme: "twilight",
        mode: "javascript"
    }, initGUI1);

});

//These lines of code are supposed to be separated into different files. 
//For the purpose of demonstration right now they are all in one place.

TButler.code("transition", function() {
    $("body").addClass("background2");
}, function() {
    $("body").removeClass("background2");
});

TButler.process("GUI1", ["transition", "editor"]);