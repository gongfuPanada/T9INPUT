function OutputCache() {
    var _cache_     = []
    var _cursor_pos = 0

    this.moveleft = function(){
        if (_cursor_pos != 0) {
            _cursor_pos--;
        }
    }
    this.moveright = function(){
        if (_cursor_pos != _cache_.length) {
            _cursor_pos++;
        }        
    }
    this.append = function(character) {
        _cache_.splice(_cursor_pos, 0, character)
        this.moveright()
        this.update();
    }
    this.backspace = function(){
        _cache_.splice(_cursor_pos-1, 1)
        this.moveleft();
        this.update();
    }
    this.del = function() {
        _cache_.splice(_cursor_pos, 1)
        this.update();
    }
    this.text = function(){
        return _cache_.join('')
    }
    this.update = function() {
        $('#t9_virtual').val(this.text())
        $('#t9_virtual').focus();
        console.log(this.text())
    }
}

OutputCache.create = function() {
    return new OutputCache;
}