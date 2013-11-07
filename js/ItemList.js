function ItemWindow() {
    var _steps = 5;
    var _front = 0;
    var _trail = 0;
    var _items = []

    this.setitems = function(items) {
        _items = items

        _front = 0
        if (_items.length < _steps) {
            _trail = _items.length
        } else {
            _trail = _steps;
        }
    }
    this.getwindowitems = function() {
        return _items.slice(_front, _trail)
    }
    this.move_forward = function(){
        if (_items.length != _trail){            
            _front = _trail
            if ((_items.length - _trail) > _steps) {
                _trail += _steps
            } else {
                _trail = _items.length
            }
        }
    }
    this.move_backward = function(){
        if (_front != 0) {
            _trail = _front
            _front -= _steps
        }
    }
}

function ItemList(el) {
    var that = this
    this._el_list = $('ul.list', el)
    var $_el_pu   = $('.page .page-up', el)
    var $_el_pd   = $('.page .page-down', el)
    this._wnd     = new ItemWindow;

    $_el_pu.on('click.item-list', function(){
        that.pageup()
    })
    $_el_pd.on('click.item-list', function(){
        that.pagedown()
    })
}

ItemList.prototype = {
    setitems: function(items) {
        this._wnd.setitems(items)
        this.update()
    },
    pagedown:function(){
        this._wnd.move_forward()
        this.update()
    },
    pageup:function(){
        this._wnd.move_backward()
        this.update()
    },
    update:function() {
        this._el_list.children().remove()
        var items = this._wnd.getwindowitems()

        for (var i = 0; i < items.length; i++) {
            var li = document.createElement('li')
            li.item = items[i]
            li.innerHTML = '<span>' + items[i].display + '</span>';
            this._el_list.append(li)

            $(li).on('click', function (){
                this.item.onselect(this.item)
            })
        }        
    },
};