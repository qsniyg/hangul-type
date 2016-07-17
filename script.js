// thanks to stackoverflow and https://github.com/123jimin/hangul-tools


var $hangul_text;
var $hangul_enter;
var $hangul_container;
var amt = 4;
//var allowed_chars = "ㅁㄴㅇㄹㅎㅗㅓㅏㅣ";
var allowed_chars = "\u3141\u3134\u3147\u3139\u314E\u3157\u3153\u314F\u3163";
var allowed_cons = "";
var allowed_vowels = "";
var allowed_jong = "";
//var consonants = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
var consonants = "\u3131\u3132\u3134\u3137\u3138\u3139\u3141\u3142\u3143\u3145\u3146\u3147\u3148\u3149\u314A\u314B\u314C\u314D\u314E";
//var vowels = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ";
var vowels = "\u314F\u3150\u3151\u3152\u3153\u3154\u3155\u3156\u3157\u3158\u3159\u315A\u315B\u315C\u315D\u315E\u315F\u3160\u3161\u3162\u3163";
var jongseong = "X\u3131\u3132\u3133\u3134\u3135\u3136\u3137\u3139\u313A\u313B\u313C\u313D\u313E\u313F\u3140\u3141\u3142\u3144\u3145\u3146\u3147\u3148\u314A\u314B\u314C\u314D\u314E";
var all_chars = consonants + vowels;
var chars_shown = false;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getTextNodeWidth(textNode) {
    var height = 0;
    if (document.createRange) {
        var range = document.createRange();
        range.selectNodeContents(textNode);
        if (range.getBoundingClientRect) {
            var rect = range.getBoundingClientRect();
            if (rect) {
                height = rect.right - rect.left;
            }
        }
    }
    return Math.round(height);
}

function getTextWidth(text, font) {
    // re-use canvas object for better performance
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
}

function pickRandom(array) {
    return array[getRandomInt(0, array.length - 1)];
}

function hangul_fix_chars() {
    if (allowed_chars.length === 0)
        allowed_chars = all_chars;

    /*if (allowed_chars.search("\u3147") < 0)
        allowed_chars += "\u3147";*/

    function fix_y(y, c1, c2) {
        if (allowed_chars.search(y) < 0 &&
            allowed_chars.search(c1) >= 0 &&
            allowed_chars.search(c2) >= 0)
            allowed_chars += y;
    }

    fix_y("\u3158", "\u3157", "\u314F");
    fix_y("\u3159", "\u3157", "\u3150");
    fix_y("\u315A", "\u3157", "\u3163");
    fix_y("\u315D", "\u315C", "\u3153");
    fix_y("\u315E", "\u315C", "\u3154");
    fix_y("\u315F", "\u315C", "\u3163");

    allowed_cons = "";
    allowed_vowels = "";

    for (var i = 0; i < allowed_chars.length; i++) {
        if (consonants.search(allowed_chars[i]) >= 0)
            allowed_cons += allowed_chars[i];
        else if (vowels.search(allowed_chars[i]) >= 0)
            allowed_vowels += allowed_chars[i];

        if (jongseong.search(allowed_chars[i]) >= 0)
            allowed_jong += allowed_chars[i];
    }
}

function hangul_get_char() {
    hangul_fix_chars();

    var parts = getRandomInt(2, 3);

    var x = consonants.indexOf(pickRandom(allowed_cons));
    var y = vowels.indexOf(pickRandom(allowed_vowels));
    var z = (parts === 3) ? jongseong.indexOf(pickRandom(allowed_jong)) : 0;

    return String.fromCharCode(0xAC00 + z + 28 * (y + 21 * x));
}

function hangul_make_phrase() {
    $hangul_text.innerHTML = "";

    amt = 4;
    var lastspace = false;

    for (var i = 0; i < amt; i++) {
        if (false &&
            !lastspace &&
            i > 0 && (i + 1) < amt &&
            getRandomInt(1, 3) === 1)
        {
            $hangul_text.innerHTML += " ";
            lastspace = true;
            continue;
        } else {
            lastspace = false;
        }

        $hangul_text.innerHTML += hangul_get_char();
    }
}

function hangul_phrase() {
    hangul_make_phrase();

    $hangul_enter.value = "";
    $hangul_enter.focus();
    $hangul_enter.setAttribute("maxlength", amt);
    //$hangul_enter.setAttribute("size", amt);
    $hangul_enter.style.width = $hangul_text.offsetWidth + "px";
}

function hangul_check() {
    var text = $hangul_text.innerHTML;
    var input = $hangul_enter.value;
    var j = 0;

    var newtext = "";
    var ret = true;

    for (var i = 0; i < text.length; i++) {
        if (text.charCodeAt(i) >= 256) {
            if (j < input.length) {
                if (text[i] === input[j]) {
                    newtext += "<span class='goodchar'>" + text[i] + "</span>";
                } else {
                    newtext += "<span class='badchar'>" + text[i] + "</span>";
                    ret = false;
                }

                j++;
            } else {
                newtext += text[i];
                ret = false;
            }
        }
    }

    $hangul_text.innerHTML = newtext;

    if (ret)
        hangul_phrase();

    return ret;
}

function hangul_input(e) {
    var result = hangul_check();

    if (e.which === 13) {
        if (result)
            hangul_phrase();
        return false;
    }

    return true;
}

function hangul_backspace(e) {
    if (e.which === 8) {
        hangul_check();
        return true;
    }

    if (e.which >= 65 && e.which <= 122 && !e.ctrlKey)
        return false;

    return hangul_input(e);
}

function hangul_showchars() {
    hangul_resizechars();

    $hangul_chars.style.top = $hangul_text.getBoundingClientRect().top + "px";
    $hangul_chars.style.display = "block";
    $hangul_text.style.visibility = "hidden";
    $hangul_chars.focus();

    chars_shown = true;
}

function hangul_hidechars() {
    $hangul_chars.style.display = "none";
    $hangul_text.style.visibility = "visible";
    $hangul_enter.focus();

    chars_shown = false;
}

function hangul_togglechars() {
    if (chars_shown)
        hangul_hidechars();
    else
        hangul_showchars();
}

function hangul_resizechars() {
    var newwidth = Math.round(getTextWidth(allowed_chars, "40px sans-serif"));
    if (newwidth > (window.innerWidth * .8))
        newwidth = window.innerWidth * .8;

    $hangul_chars.style.width = newwidth + "px";
}

function hangul_changechars() {
    var last_select = $hangul_chars.selectionStart;

    allowed_chars = $hangul_chars.value;
    hangul_fix_chars();
    $hangul_chars.value = allowed_chars;

    $hangul_chars.setSelectionRange(last_select, last_select);

    hangul_resizechars();

    hangul_make_phrase();
}

document.addEventListener("DOMContentLoaded", function(event) {
    $hangul_text = document.getElementById("text");
    $hangul_enter = document.getElementById("enter");
    $hangul_chars = document.getElementById("chars");
    $hangul_container = document.getElementById("hangul-container");

    $hangul_chars.oninput = hangul_changechars;
    $hangul_chars.value = allowed_chars;
    hangul_changechars();
    $hangul_chars.setSelectionRange(allowed_chars.length,
                                    allowed_chars.length);

    $hangul_text.onclick = hangul_showchars;
    $hangul_chars.onblur = hangul_hidechars;

    //$hangul_enter.onkeypress = hangul_input;
    $hangul_enter.onkeydown = hangul_backspace;
    $hangul_enter.oninput = hangul_input;

    document.addEventListener("keydown", function(e) {
        if (e.which === 27)
            hangul_togglechars();
    }, false);

    window.setTimeout(hangul_phrase, 1);
});
