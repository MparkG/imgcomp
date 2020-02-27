// Javascript code for flipping through an hour's worth of images from imgcomp
// Invoked from HTML generated by view.cgi module showpic.c
function UpdateLinks(){
    // Update list of nav links at botom of page.
    var links = ""
    var BEFORE = 4
    var AFTER = 5
    if (prefix.length != 7) {BEFORE=3;AFTER=4}
    var From = pic_index-BEFORE;
    if (From < -1) From = -1;
    var To = From+BEFORE+AFTER+1;
    if (To > piclist.length+1){
        To = piclist.length+1;
        From = To-BEFORE-AFTER-1;
        if (From < -1) From = -1;
    }
    if (From > 0) links += "<a href=\"#\" onclick=\"SetIndex("+0+")\">&lt;&lt;</a> ";

    var PrevSecond = -1
    
    for (a=From;a<To;a++){
        if (a < 0){
            if (PrevDir) links += "<a href='view.cgi?"+PrevDir+"/#9999'>Prev dir</a> &nbsp;"
            continue;
        }
        if (piclist.length == 0) links += "Directory contains no images"
        if (a >= piclist.length){
            if (NextDir) links += "&nbsp; <a href='view.cgi?"+NextDir+"/#0000'>Next dir</a>"
            continue;
        }
        
        Name = piclist[a];
        var between = " "
        if (prefix.length == 7){
            // Extract the time (MM:SS) part of the file name to show.
            TimeStr = Name.substring(0,2)+":"+Name.substring(2,4)
            var Second = Name.substring(0,2)*60 + Name.substring(2,4)*1
            if (a > From && a > 0){
                dt = Second - PrevSecond;
                if (dt >= 3 && dt < 5) between = "&nbsp;"
                if (dt >= 5 && dt < 10) between = " - "
                if (dt > 20) between = " || &nbsp;"
            }
            PrevSecond = Second
        }else{
            // Show MMDD-HH
            TimeStr = (prefix+Name).substring(0,7)
        }
        links += between

        if (a == pic_index){
            if (prefix.length == 7) TimeStr = prefix.substring(5,7)+":"+TimeStr
            links += "<b>"+TimeStr+"</b>"
        }else{
            links += "<a href=\"#"+Name.substring(0,5).trim()
                 +"\" onclick=\"SetIndex("+a+")\">"+TimeStr+"</a>";
        }
    }
    if (To < piclist.length) links += 
        " <a href=\"#\" onclick=\"SetIndex("+(piclist.length-1)+")\">>></a>";
    document.getElementById("links").innerHTML=links;
}

function UpdateActagram(){
// Update the actagram text character display below the nav links.    
    act = ""
    var thismin
    if (piclist.length) thismin = parseInt(piclist[pic_index].substring(0,2))

    for (a=0;a<60;a++){
        if (!(b = ActBins[a])){
            act += "&nbsp;"; continue
        }
        c = '-'
        if (b>=6)c='='
        if (b>=18)c='#'
        if (a==thismin){
            act += "<b style='background-color: #b0b0ff;'>"+c+"</b>"
        }else{
            act += "<a href='#"+piclist[ActNums[a]].substring(0,5).trim()
                + "' onclick='SetIndex("+ActNums[a]+")'>"+c+"</a>"
        }
    }
    document.getElementById("actagram").innerHTML = "00"+act+"60"
}

ImgLoading = false
NextImgUrl = ""
function UpdatePix(){
    if (piclist.length){
        var imgname = subdir+prefix+piclist[pic_index]+".jpg"
        var url = pixpath+imgname;
        if (AdjustBright) url = "tb.cgi?"+imgname+(ShowBigOn?"$1":"$2")
        if (ImgLoading){
            NextImgUrl = url;
        }else{
            document.getElementById("view").src = url
            ImgLoading = true
        }
        var nu = window.location.toString()
        nu = nu.split("#")[0]+"#";
        console.log(prefix)
        if (prefix.length){
            nu += piclist[pic_index].substring(0,5).trim();
        }else{
            nu += piclist[pic_index].trim();
        }
        window.location = nu;
            
        document.title = imgname
    }
    if (!isSavedDir) document.getElementById("save").innerHTML = "Save"
    UpdateLinks();
    UpdateActagram()
}

function DoNext(dir){
    if (pic_index+dir < 0 || pic_index+dir >= piclist.length){
        PlayStop()
        return 0
    }else{
        pic_index += dir
        UpdatePix();
        return 1
    }
}

ScrollDir = 0
ScrollTimer = 0
function ScrollMoreTimer()
{
    var img = document.querySelector('img')
    if (ImgLoading) {
        // Image is not loaded yet.  Once it's loaded, set a shorter timer
        // (to avoid recursion problems)
        img.addEventListener('load', SetLateTimer())
        return;
    }

    if (ScrollDir){
        if (DoNext(ScrollDir)){
            ScrollTimer = setTimeout(ScrollMoreTimer,isSavedDir?400:100)
        }
    }
}
function SetLateTimer(){
    console.log("late timer");
    ScrollTimer = setTimeout(ScrollMoreTimer, 20)
}

function PlayStart(dir)
{
    ScrollDir = dir
    DoNext(ScrollDir)
    ScrollTimer = setTimeout(ScrollMoreTimer, 400)
}
function PlayStop()
{
    ScrollDir = 0
    document.getElementById("play").innerHTML="Play"
    clearTimeout(ScrollTimer)
    
}

function PlayButton()
{
    if (ScrollDir){
        PlayStop()
    }else{
        if (pic_index >= piclist.length-1) pic_index = 0
        PlayStart(1)
        document.getElementById("play").innerHTML="Stop"
    }
}

DragActive = false
xref = 0;
ref_index = 0;
MouseIsDown = 0


function PicMouse(picX,picY,IsDown)
{
    picX -= vc.offsetLeft
    picY -= vc.offsetTop
    //dbg.innerHTML = "Mouse "+picX+", "+picY+" Down="+IsDown;
    if (IsDown){
        var leftright = 0;
        if (picX < ShwW*.2) leftright = -1
        if (picX > ShwW*.8) leftright = 1
        if (!MouseIsDown){
            // Mouse was just pressed.
            ImgLoading = false
            if (leftright){
                // Start playing forwards or backwards.
                PlayStart(leftright)
            }else{
                // Start of drag scrolling.
                xref = picX;
                ref_index = pic_index;
                DragActive = true
            }
        }else{
            if (ref_index >= 0){
                // Drag scrolling is active.
                var relmove = (picX-xref)/ShwW;
                var targindex = Math.round(ref_index+relmove*piclist.length);
                if (targindex < 0) targindex = 0
                if (targindex >= piclist.length) targindex = piclist.length-1
                SetIndex(targindex)
            }else{
                if (leftright == 0){
                    // Drag start out of left/right region
                    PlayStop();
                    xref = picX
                    ref_index = pic_index;
                    DragActive = true
                }
            }
        }
    }else{
        if (MouseIsDown){
            // Mouse was just released.
            PlayStop();
        }
        ref_index = -1;
        DragActive = false;
    }
    MouseIsDown = IsDown;
}

function picLoaded()
{
    if (!ImgLoading) return;
    if (NextImgUrl){
        document.getElementById("view").src = NextImgUrl
        NextImgUrl = ""
    }else{
        ImgLoading = false;
    }
}

function SetIndex(index)
{
    pic_index = index
    UpdatePix()
}

function DoSavePic(){
    // Instruct back end to copy picture to the "Saved" directory.
    var SaveUrl = "view.cgi?~"+subdir+prefix+piclist[pic_index]+".jpg"
    var xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange=function(){
        if (this.readyState==4 && this.status==200){
            var wt=xhttp.responseText.trim()
            if(wt.indexOf('Fail:')>=0)
               wt="<span style='color: rgb(255,0,0);'>["+wt+"]</span>"
             document.getElementById("save").innerHTML=wt
        }
    };
    xhttp.open("GET", SaveUrl, true)
    xhttp.send()
}

ShowBigOn = 0
function ShowBig(){
    ShowBigOn = !ShowBigOn
    document.getElementById("big").innerHTML= ShowBigOn?"Smaller":"Enlarge"
    if (ShowBigOn){
        SizeImage(PicWidth, PicHeight)
    }else{
        SizeImage(950,550)
    }
    ImgLoading = false
    UpdatePix()
}
AdjustBright = 0
function ShowBright(){
    AdjustBright = !AdjustBright
    document.getElementById("bright").innerHTML= AdjustBright?"Normal":"Brighten"
    ImgLoading = false
    UpdatePix()
}

function ShowDetails(){
    var nu = window.location.toString()
    nu = nu.substring(0,nu.indexOf("#"))+prefix+piclist[pic_index]+".jpg"
    window.location = nu
}

function SizeImage(maxw, maxh)
{
    var Qt
    ShwW = maxw
    if (ShwW > window.innerWidth-15) ShwW = window.innerWidth-15;
    if (piclist.length == 0){
        return;
    }
    if (PicWidth > 0){
        ShwH = Math.round(ShwW*PicHeight/PicWidth)
        if (ShwH > maxh){
            ShwH = maxh;
            ShwW = Math.round(ShwH*PicWidth/PicHeight)
        }
        Qt = Math.round(ShwW/4)
    }else{
        ShwW = 320; ShwH = 240
    }
    vc.width = ShwW
    vc.height = ShwH
}

vc = document.getElementById('view');
vc.onload = picLoaded

// Functions to consolidate the various ways of reporting mouse or finger actions into one place.
// so that it works the same way on PC and iPad
function picMouseDown(e) { PicMouse(e.clientX,e.clientY,1); }
function picMouseMove(e) { PicMouse(e.clientX,e.clientY,MouseIsDown); }
function picDrag(e){
    if ((e.clientY-vc.offsetTop) < ShwH*.2) return true; // Allow dragging image out of brwser near top.
    PicMouse(e.clientX,e.clientY,1);
    return false;
}
function picMouseUp() {PicMouse(0,0,0);}
function picTouchStart(e){PicMouse(e.touches[0].clientX,e.touches[0].clientY,1);}
function picTouchMove(e){PicMouse(e.touches[0].clientX,e.touches[0].clientY,1)}

vc.ondragstart = picDrag
vc.onmousedown = picMouseDown
vc.onmouseup = picMouseUp
vc.onmouseleave = picMouseUp
vc.onmousemove = picMouseMove
vc.ontouchstart = picTouchStart
vc.ontouchend = picMouseUp
vc.ontouchmove = picTouchMove
//dbg = document.getElementById("dbg");

SizeImage(950,550);

// Fill bins for actagram (a sort of motion time histogram)
ActBins = []
ActNums = []
for (a=0;a<piclist.length;a++){
    min = parseInt(piclist[a].substring(0,2))
    if (ActBins[min]) ActBins[min]++
    else ActBins[min] = 1
    if (!ActNums[min] || piclist[a].substring(2,4) < "30") ActNums[min] = a;
}

// Figure out index in picture list given the time in the URL after the #
pic_index=0
pictime = (window.location.toString()).split("#")[1];
if (pictime){
    for (;pic_index<piclist.length-1;pic_index++){
        if (piclist[pic_index] >= pictime) break;
    }
}
UpdatePix()
