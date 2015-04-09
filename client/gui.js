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
        makeRect: function(bigger,arrayOfEles,transform){
            bigger = bigger || 0;
            if(arrayOfEles !== undefined){
                //group them
                var array = [];
                arrayOfEles.push(this);
                arrayOfEles.forEach(function(e){
                    if(e.group!== undefined){
                        array.push(e.group);
                    }else{
                        array.push(e._);
                    }
                });
                var group = new archySnapWrap(paper.g.apply(paper,array));
                return group.makeRect(bigger,undefined,transform);
            }
            this.rect = paper.rect(this.x() - bigger / 2, this.y() - bigger / 2, this.width() + bigger, this.height() + bigger);
            this.group = paper.g(this.rect,this._);
            var transformation = transform || "matrix(1,0,0,1,0,0)";
            this.rect.attr({
                "fill-opacity":0,
                "transform":transformation
            });
            return this;
        },
        transform: function(m){
            return this._.attr({
                        transform: m
                    });
        },
        CLICK: function(fn){
            this.pointerize().click(fn);
        },
        DRAG : function(fn0,fn1,fn2){
            this.pointerize().drag(fn0,fn1,fn2);
        },
        pointerize : function() {
            if(this.rect === undefined) this.makeRect();
            this.group.node.style.cursor = "pointer";
            return this.group;
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
                //manyToX oneToX icons
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
                var manyToXMatrix = "matrix(1,0,0,1," + x + "," + (y + 18) + ")",
                    manyToXMatrix0 = "matrix(0,0,0,0," + x + "," + (y + 18) + ")",
                    oneToXMatrix = "matrix(1,0,0,1," + x + "," + y + ")",
                    oneToXMatrix0 = "matrix(0,0,0,0," + x + "," + y + ")";
                var manyToX = line3.makeRect(0,[line1, line2],manyToXMatrix);
                oneToX = oneToX.makeRect(0,undefined,oneToXMatrix);
                manyToX.transform(manyToXMatrix0);
                oneToX.transform(oneToXMatrix0);

                //hover
                var group = object.makeRect(0,[text]);
                var supergroup = group.makeRect(23,[manyToX,oneToX]);
                supergroup.group.hover(function(){
                    oneToX._.stop().animate({
                            transform: oneToXMatrix
                        },
                        500, mina.elastic);
                    manyToX._.stop().animate({
                            transform: manyToXMatrix
                        },
                        500, mina.elastic);
                    }, function() {
                    oneToX._.stop().animate({
                            transform: oneToXMatrix0
                        },
                        300, mina.easeout);
                    manyToX._.stop().animate({
                            transform: manyToXMatrix0
                        },
                        300, mina.easeout);
                });
                //drag (entire object)
                var start_x = 0, start_y = 0;
                group.DRAG(function(dx, dy, x, y) {
                    supergroup.group.attr({
                        transform: "matrix(1,0,0,1," + (start_x + dx) + "," + (start_y + dy) + ")"
                    });
                }, function(){}, function(event) {
                    start_x = supergroup.group.matrix.e;
                    start_y = supergroup.group.matrix.f;
                });
                //drag (oneToX)
                var line = $("line").$(0, 0, 0, 0);
                line._.attr({
                    "stroke-width": "1",
                    stroke: "black"
                })
                var placholder1 = $(oneToX._.clone());
                placholder1._.attr({
                    "fill-opacity":0
                });
                $.paper().prepend(placholder1._);
                oneToX.DRAG(
                    function(dx,dy,x,y,event){
                        line._.attr({
                            x2:dx,
                            y2:dy
                        });
                    },function(x,y,event){
                        placholder1._.attr({
                            "fill-opacity":1,
                            transform: oneToXMatrix
                        });
                        line.transform(oneToXMatrix);
                    },function(event){
                        line._.attr({
                            x2:0,
                            y2:0
                        });
                        placholder1._.stop().animate({
                            transform: oneToXMatrix0,
                            "fill-opacity":0
                        },
                        300, mina.easeout);
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

        /* data & data function*/

        var collectionNames = [];

        var checkDuplicateName = function(s){
            var a = 0;
            while(a<collectionNames.length){
                var existed = collectionNames[a];
                if(existed===s){
                    existed_number = parseInt(existed[existed.length-1]);
                    if(existed_number>1){
                        s_number = parseInt(s[s.length-1]);
                        console.log(s_number,s)
                        if(s_number>1){
                            s = s.slice(0,-1);
                            var highest = s_number > existed_number? s_number : existed_number;
                            s+=(highest+1);
                        }else{
                            //s last is not a number
                            s+=(existed_number+1);
                        }
                        return checkDuplicateName(s);
                    }else{
                        s+=2;
                        return checkDuplicateName(s);
                    }
                }
                a++;
            }
            return s;
        }

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
                    collectionName = checkDuplicateName(collectionName);
                    input.removeClass("inputBeneath");
                    var text = $._.appendTextBeneath(obj,below.x,below.y,collectionName);
                    _editor.createCollection(collectionName);
                    collectionNames.push(collectionName);
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