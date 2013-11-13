function T9_keyboard_backend(keyboard){
    var keyboard_ = keyboard

    this.keyboard = function() {
        return keyboard_;
    }
}

T9_keyboard_backend.prototype.renew = function(){
    this.keyboard().updatelist([])
}

T9_keyboard_backend.prototype.eat = function(){
}

T9_keyboard_backend.prototype.onselect = function(item) {
    console.log('select')
}
T9_keyboard_backend.prototype.backspace = function(){
    this.keyboard().inputable().backspace()
}

//
//
//
//
function T9_keyboard_num_backend(keyboard) {
    this.hint = 'Num'
    T9_keyboard_backend.call(this, keyboard)

    this.eat = function(keycode) {
        this.keyboard().inputable().append(keycode)
    }
}
T9_keyboard_num_backend.prototype = new T9_keyboard_backend;
T9_keyboard_num_backend.prototype.constructor = T9_keyboard_num_backend

//
//
//
//
function T9_keyboard_en_backend (keyboard){
    this.hint = 'EN'
    this.keyboard = keyboard
    T9_keyboard_backend.call(this, keyboard)
}

T9_keyboard_en_backend.symbols = [
    '.', '-', '_', '+', "=", '!', '~', '`', '@', 
    '#', '$', '%', '^', '&', '*', '(', ')', '{', '}', '[', ']', ':', ';', 
    '"', '\'', '<', '>', ',', '?', '/', '|'
];

T9_keyboard_en_backend.keys = ['ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQRS', 'TUV', 'WXYZ']

T9_keyboard_en_backend.map = function(string) {
    var upper = string.toUpperCase(string)
    var lower = string.toLowerCase(string)            
    var finnal = upper + lower;
    var items = []

    for (var i = 0; i < finnal.length; i++) {
        items.push({
            display: finnal.charAt(i)
        })
    }
    return items;
}

T9_keyboard_en_backend.prototype = new T9_keyboard_backend;
T9_keyboard_en_backend.prototype.constructor = T9_keyboard_en_backend

T9_keyboard_en_backend.prototype.eat = function(keycode) {
    switch (keycode) {
        case '0':
            this.keyboard().inputable().append(' ')
            break;
        case '1':
            var items = []
            for (var i in T9_keyboard_en_backend.symbols) {
                items.push({
                    display: T9_keyboard_en_backend.symbols[i]
                })
            }
            this.keyboard().updatelist(items)
            break;
        case '2':                
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
            var index = parseInt(keycode) - 2
            this.keyboard().updatelist(T9_keyboard_en_backend.map(T9_keyboard_en_backend.keys[index]))
            break;
        default:
            console.log('unexpect key')
    }
}

T9_keyboard_en_backend.prototype.onselect = function(item) {
     this.keyboard().inputable().append(item.display)
     this.keyboard().updatelist([])
}

//
//
//
//
//
function T9_keyboard_py_backend(keyboard){
    this.hint      = 'PY'
    this._accepts_ = []

    T9_keyboard_backend.call(this, keyboard)
}

T9_keyboard_py_backend.symbols = [
    '。', '？', '！', '，', '、', '；', '：', '“', '”', '‘', '’', '（', '）', '-', '.', '《', '》'
]

T9_keyboard_py_backend.prototype = new T9_keyboard_backend;
T9_keyboard_py_backend.prototype.constructor = T9_keyboard_py_backend

T9_keyboard_py_backend.prototype.isaccept = function(keycode) {
    var number = parseInt(keycode)

    if (number > 9 || number < 1) return false;

    var pre = this._accepts_.join('') + keycode
    var indexs = t9_get_pinyin_index(pre);

    return indexs.length != 0;
}

T9_keyboard_py_backend.prototype.accept = function(keycode) {
    this._accepts_.push(keycode)
    var indexs = t9_get_pinyin_index(this._accepts_.join(''))

    var items = []
    for (var i in indexs) {
        items.push({
            type: 'py',
            display:indexs[i]
        })
    }
    this.keyboard().updatelist(items)
}

T9_keyboard_py_backend.prototype.eat = function(keycode) {
    switch (keycode) {
        case '0':
            this.keyboard().inputable().append(' ')
            break;
        case '1':
            var items = []
            for (var i in T9_keyboard_py_backend.symbols) {
                items.push({
                    display: T9_keyboard_py_backend.symbols[i]
                })
            }
            this.keyboard().updatelist(items)
            break;
        case '2':                
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
            if (this.isaccept(keycode)) {
                this.accept(keycode)
            }
            break;
        default:
            console.log('unexpect key')
    }
}

T9_keyboard_py_backend.prototype.onselect = function(item) {    
    if (item.type == 'py') {
        this._accepts_ = []
        
        var pingyin = item.display
        var results = pinyin_tbl[item.display]
        var items = []
        for (var i in results) {
            items.push({
                type: 'finnal',
                display: results[i]
            })
        }
        this.keyboard().updatelist(items)
    } else {
        this.keyboard().inputable().append(item.display)
        this.keyboard().updatelist([])
    }
}
T9_keyboard_py_backend.prototype.backspace = function(){
    if (this._accepts_.length) {
        this._accepts_.pop()
        if (this._accepts_.length) {
            var indexs = t9_get_pinyin_index(this._accepts_.join(''))
            var items = []
            for (var i in indexs) {
                items.push({
                    type: 'py',
                    display:indexs[i]
                })
            }
            this.keyboard().updatelist(items)
        } else {
            this.keyboard().updatelist([])
        }
    } else {
        this.keyboard().inputable().backspace()    
    }    
}