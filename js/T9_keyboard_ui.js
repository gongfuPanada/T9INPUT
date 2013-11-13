$(function () {
    function ItemList($el) {
        var $list_items = $('>li', $el)
        var front_ = 0;
        var trail_ = 0;
        var steps  = 5;
        var itemcache_ = []

        function construct() {
        }

        function refresh() {
            $list_items.text('')
            $list_items.data('item', null)

            for (var i = 0; i < (trail_ - front_); i++) {
                $list_items[i].innerHTML = itemcache_[front_ + i].display;
                $($list_items[i]).data('item', itemcache_[front_ + i]);
            }
        }

        this.update = function(items) {
            itemcache_ = items
            front_ = 0
            if (itemcache_.length < steps) {
                trail_ = itemcache_.length
            } else {
                trail_ = steps;
            }
            refresh();
        }

        this.forward = function() {
            if (itemcache_.length != trail_){            
                front_ = trail_
                if ((itemcache_.length - trail_) > steps) {
                    trail_ += steps
                } else {
                    trail_ = itemcache_.length
                }
            }
            refresh();
        }

        this.backward = function() {
            if (front_ != 0) {
                trail_ = front_
                front_ -= steps
            }
            refresh();
        }

        construct()
    }

    function T9_keyboard_ui() {
        var that       = this
        var $modal     = null
        var itemlist_  = null

        this.show = function(positsion) {
            $modal.modal('show')
            if (positsion) {
                $modal.css(positsion)
            }

            $(document).on('click.t9_keyboard', function(ev){
                if (ev.target !== $modal[0] && !$modal.has(ev.target).length) {
                    $(document).off('click.t9_keyboard')                    
                    $modal.modal('hide')
                    $(that).trigger('invalid')
                }
            })
        }

        this.hide = function() {
            $modal.modal('hide')
        }
        this.change = function(backend){
            $modal.find('.key[code="103"]').find('>span >per').text(backend.hint)
        }
        this.updatelist = function(list) {
            itemlist_.update(list)
        }
        this.pageup = function() {
            itemlist_.backward()
        }
        this.pagedown =function() {
            itemlist_.forward()
        }
        function construct () {            
            $modal = $('<div class="modal hide" id="t9-modal"><div class="modal-header"></div><div class="modal-body"></div></div>')
            var rows = {
                row1: [
                    {num: 1, character:';',   code: '1'},
                    {num: 2, character:'ABC', code: '2'},
                    {num: 3, character:'DEF', code: '3'},
                    {code:  '100'}
                ],
                row2: [
                    {num: 4, character:'HGI', code: '4'},
                    {num: 5, character:'JKL', code: '5'},
                    {num: 6, character:'MNO', code: '6'},
                    {code:  '101'}
                ],
                row3: [
                    {num: 7, character:'PQRS', code: '7'},
                    {num: 8, character:'TUV' , code: '8'},
                    {num: 9, character:'WXYZ', code: '9'},
                    {code: '102'}
                ],
                row4: [
                    {code: '103'},
                    {num : 0, character:'_', code: '0'},
                    {code: '200'}
                ]
            }

            var $t9_keyboard = $('<div id="t9_keyboard"></div>')

            //item-list
            //
            var $item_list = $('<ul class="item-list"><li></li><li></li><li></li><li></li><li></li></ul>')

            //keys
            //
            var $keys = $('<ul class="keys"></ul>')
            for (var row in rows) {
                var $row = $('<li></li>')
                for (var key in rows[row]) {
                    var $key  = $("<div class='key' code='" + rows[row][key].code + "'>")
                    var $span = $("<span></span>")
                    switch (rows[row][key].code) {
                        case '100':
                            $span.addClass("key-delete")
                            break;
                        case '101':
                            $span.addClass("key-pageup")
                            break;
                        case '102':
                            $span.addClass("key-pagedown")
                            break;
                        case '103':
                            $span.append("<per>Num</per>")
                            break;
                        case '200':                    
                            $key.addClass('large')
                            $span.append("<per>Enter</per>")
                            break;
                        default:
                            $span.append("<per class='num'> " + rows[row][key].num + "</per> \
                                              <per class='character'>" + rows[row][key].character + "</per>")
                    }
                    $key.append($span)
                    $row.append($key)
                }
                $keys.append($row)
            }

            $modal.modal({
                backdrop: false,
                keyboard: false,
                show:     false
            })

            $modal.drags({handle: '.modal-header'})

            $keys.find('.key').on('click', function(e) {
                e.preventDefault();

                var code = $(this).attr('code')
                var event = $.Event("keydown", {keycode: code});
                $(that).trigger(event)
            })

            $item_list.find('>li').on('click', function(e) {
                e.preventDefault();
                
                var $this = $(this)
                var item = $this.data('item')
                if (item != null) {
                    var event = $.Event("select", {item: item});
                    $(that).trigger(event)
                }
            })

            itemlist_ = new ItemList($item_list)
            $t9_keyboard.append($item_list)
            $t9_keyboard.append($keys)
            $('.modal-body', $modal).append($t9_keyboard)
            $(document.body).append($modal)
        }
        construct()
    }

    function T9_keyboard() {
        var that      = this
        var index     = 0;
        var backends  = [];
        var ui
        var inputable_ = null

        this.updatelist = function(list) {
            ui.updatelist(list)
        }
        this.inputable = function(args){
            if(args === 'undefined' || args == null) {
                return inputable_
            } else {
                if (inputable_ && inputable_ != args) {
                    inputable_.invalid()
                }
                inputable_ = args
            }
        }
        this.show = function(positsion){
            ui.show(positsion)
        }
        this.hide = function(){
            ui.hide()
        }
        function construct() {
            backends.push(new T9_keyboard_num_backend(that))
            backends.push(new T9_keyboard_py_backend(that))
            backends.push(new T9_keyboard_en_backend(that))

            ui = new T9_keyboard_ui()
            $(ui).on('keydown', onkeydown);
            $(ui).on('select', onselect);

            $(ui).on('invalid', function(){
                inputable_.invalid()
            })

            ui.change(backends[index])
            backends[index].renew()
        }

        function onkeydown(event) {
             switch (event.keycode) {
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
                    backends[index].eat(event.keycode)
                    break;
                case '100': 
                    backends[index].backspace()
                    break;                
                case '101':
                    ui.pageup()
                    break;                
                case '102':
                    ui.pagedown()
                    break;
                case '103':
                    index = (++index % 3)                    
                    ui.change(backends[index])
                    backends[index].renew()
                    break;
                case '200':
                    inputable_.invalid()
                    ui.hide()
                    break;
                default:
                    console.error('unaccepted key(code = ' + keycode +')')    
            }
            inputable_.focus()
        }

        function onselect(event) {
            backends[index].onselect(event.item)
        }

        construct();
    }

    function Inputable(input) {
        var that      = this
        var $input_   = $(input)
        var isInvalid = true
        var cache_  = []

        this.focus = function(){
            $input_.focus()
        }

        this.append = function(char) {
            cache_.push(char)
            update()
        }
        this.backspace = function() {
            cache_.pop()
            update()
        }

        this.toggle = function(){
            isInvalid ? this.active() : this.invalid()
        }

        this.active = function () {
            if (isInvalid) {
                isInvalid = false                
                $.t9_keyboard.inputable(that)

                $input_.addClass('inputting')
                var positsion = $input_.offset()
                positsion.top += $input_.innerHeight()

                $.t9_keyboard.show(positsion)
            }
            renew_cache()
        }

        this.invalid = function () {
            if (!isInvalid) {
                isInvalid = true
                $input_.removeClass('inputting')
                $.t9_keyboard.hide()
            }
        }

        function renew_cache(){
            cache_ = []
            var val = $input_.val()
            for (var i = 0; i < val.length; i++) {
                cache_.push(val.charAt(i))
            }
        }

        function update() {
            $input_.val(cache_.join(''))
            $input_.focus()
        }

        function construct() {            
            $input_.on('click', function(e){
                e.preventDefault()
                e.stopImmediatePropagation()
                that.active()
            })
        }
        construct()
    }

    $.t9_keyboard = new T9_keyboard;

    $.fn.t9_inputable = function(option) {
        return $(this).each(function(){
            var $this = $(this)
                , data = $this.data('inputable')
                if (!data) $this.data('inputable', (data = new Inputable(this)))                    
        })
    }

    $(document).on('click.t9_inputable', '[data-role="t9_inputable"]', function(e){
        e.preventDefault()
        e.stopImmediatePropagation()

        $(this).t9_inputable()
        $(this).data('inputable').active()
    })
})