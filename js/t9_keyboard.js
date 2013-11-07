/*
 *
 *
 * 
 */
function T9_pinyin_state(keyboard) {
    this._keyboard = keyboard
    this._accepts_ = []
}

T9_pinyin_state.prototype.updatelist = function() {
    var items = []
    if (this._accepts_.length != 0) {
        var indexs = t9_get_pinyin_index(this._accepts_.join(''));
        
        for (var i = 0; i < indexs.length; i++) {
            items.push({
                type: 0,
                state: this, 
                keyboard: this._keyboard,
                index: indexs[i],
                display: indexs[i], 
                onselect: T9_pinyin_state.onselect
            })
        }
    }
    this._keyboard.item_list.setitems(items)
}

T9_pinyin_state.prototype.accept = function(number) {
    if (number > 9 || number < 1) return false;

    var pre = this._accepts_.join('') + number
    var indexs = t9_get_pinyin_index(pre);

    return indexs.length != 0;
}

T9_pinyin_state.prototype.feed = function(number) {
    switch(number) {
        case '0':
            if (this._accepts_.length == 0) {
                this._keyboard.outputcache_.append(' ')
            }
            break;
        case '1':
            if (this._accepts_.length == 0) {
                var items = [];
                for (var i in t9_pinyin_symbol) {
                    items.push({
                        type: 1,
                        state: this, 
                        keyboard: this._keyboard,
                        display: t9_pinyin_symbol[i], 
                        onselect: T9_pinyin_state.onselect
                    })                    
                }
                this._keyboard.item_list.setitems(items)
            }
            break;
        default:
            if (!this.accept(number)) return;
            this._accepts_.push(number)
            this.updatelist();        
    }    
}

T9_pinyin_state.prototype.backspace = function(number) {
    if (this._accepts_.length != 0) {
        this._accepts_.pop()
        this.updatelist();
    } else {
        this._keyboard.outputcache_.backspace()
    }    
}

T9_pinyin_state.onselect = function(item) {
    var state = item.state
    var keyboard = item.keyboard

    if (item.type == 0) {
        var result = pinyin_tbl[item.index]

        var items = []
        
        for (var i = 0;  result && i < result.length; i++) {
            items.push({
                type: 1, 
                state: state,
                keyboard: keyboard,
                display: result[i], 
                onselect: T9_pinyin_state.onselect
            })
        }
        keyboard.item_list.setitems(items)
    } else {
        state._accepts_ = []
        keyboard.outputcache_.append(item.display)
        keyboard.item_list.setitems([])
    }
}

/*
 *
 *
 * 
 */
function T9_english_state(keyboard) {
    this._keyboard = keyboard
    this._accepts_ = []
}

T9_english_state.prototype.feed = function(number) {
    switch(number) {
        case '0':
            if (this._accepts_.length == 0) {
                this._keyboard.outputcache_.append(' ')
            }
            break;
        case '1':
            if (this._accepts_.length == 0) {
                var items = [];
                for (var i in t9_english_symbol) {
                    items.push({
                        state: this, 
                        keyboard: this._keyboard,
                        display : t9_english_symbol[i], 
                        onselect: T9_english_state.onselect
                    })                    
                }
                this._keyboard.item_list.setitems(items)
            }
            break;
        default:
            this._accepts_.push(number)
            this.updatelist()
    }    
}

T9_english_state.prototype.updatelist = function() {
    var items = []
    if (this._accepts_.length != 0) {
        var list = t9_get_english_index(this._accepts_[0])
        var items = [];
        for (var i in list) {
            items.push({
                state: this, 
                keyboard: this._keyboard,
                display : list[i], 
                onselect: T9_english_state.onselect
            })                    
        }        
    }
    this._keyboard.item_list.setitems(items)
}

T9_english_state.prototype.backspace = function(number) {
    if (this._accepts_.length != 0) {
        this._accepts_.pop()
        this.updatelist();
    } else {
        this._keyboard.outputcache_.backspace()
    }    
}

T9_english_state.onselect = function(item) {
    var state = item.state
    var keyboard = item.keyboard
    state._accepts_ = []
    keyboard.outputcache_.append(item.display)
    keyboard.item_list.setitems([])
}

/*
 *
 *
 * 
 */
function T9_number_state(keyboard) {
    this._keyboard = keyboard
}

T9_number_state.prototype.feed = function(number) {    
    this._keyboard.outputcache_.append(number)
}

T9_number_state.prototype.backspace = function(number) {
    this._keyboard.outputcache_.backspace()
}

//
//
//
//
//
function T9_keyboard ($el) {
    var that          = this
    var $el_keys        = $el.find('.key');
    var $el_item_list   = $el.find('.item-list')

    var states = [];

    states.push(new T9_pinyin_state(this));
    states.push(new T9_english_state(this));  
    states.push(new T9_number_state(this));

    states[0].flag = 'PY'
    states[0].next = states[1]

    states[1].flag = 'EN'
    states[1].next = states[2]

    states[2].flag = 'NUM'
    states[2].next = states[0]

    this.current_state  = states[2];

    this.item_list = new ItemList(this.$el_item_list)
    this.outputcache_ = OutputCache.create();

    $el_keys.on('click.T9_keyboard', function(event){
        event.preventDefault()
        event.stopPropagation()

        var $this = $(this)
        var keycode = $this.attr('code')
        that.feed($this, keycode);
    })
}

T9_keyboard.create = function($el) {
    return new T9_keyboard($el)
}

T9_keyboard.prototype = {
    feed:function($key, keycode){
        switch (keycode) {
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.current_state.feed(keycode)
                break;
            case '100': 
                this.current_state.backspace()
                break;
                //backspace
            case '101':
                this.item_list.pageup(); 
                break;
                //page up
            case '102':
                this.item_list.pagedown();
                break;
                //page down
            case '103':
                this.current_state = this.current_state.next;
                $key.find('>span').html('<per>' + this.current_state.flag + '</per>')
                break;
            case '200':
                //enter
            default:
                console.error('unaccepted key(code = ' + keycode +')')
        }
    }
};
