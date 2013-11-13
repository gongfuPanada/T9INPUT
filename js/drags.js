(function($) {
    function Drag($el, option) {
        var $el   = $el
        var $drag = null
        var drg_h = 0
        var drg_w = 0
        var drg_y = 0
        var drg_x = 0

        function begin(e){
            drg_h = $drag.outerHeight(),
            drg_w = $drag.outerWidth(),
            pos_y = $drag.offset().top  + drg_h - e.pageY,
            pos_x = $drag.offset().left + drg_w - e.pageX;

            e.preventDefault();
            regist()
        }
        function move(e){
            $el.offset({
                top: e.pageY + pos_y - drg_h,
                left:e.pageX + pos_x - drg_w
            })
            e.preventDefault();
        }
        function end(e){
            e.preventDefault();
            unregist()
        }
        
        function regist(){
            $(document).on('mousemove.drag', move)
            $(document).on('mouseup.drag', end)
        }
        function unregist(){
            $(document).off('mousemove.drag')
            $(document).off('mouseup.drag')
        }
        function construct(){
            if (option.handle === '') {
                $drag = $el
            } 
            else {
                $drag = $el.find(option.handle)
            }
            $drag.css('cursor', option.cursor)
            $drag.on('mousedown.drag', begin)
        }
        construct()
    }
    
    Drag.default = { 
        handle: "",
        cursor:"move"
    }

    $.fn.drags = function(opt) {
        return $(this).each(function(){
            var $this   = $(this),
                options = $.extend(Drag.default, typeof opt === 'object' && opt);
                data    = $this.data('drag')
            if (!data) $this.data('drag', (data = new Drag($this, options)))
        })
    }
})(jQuery);