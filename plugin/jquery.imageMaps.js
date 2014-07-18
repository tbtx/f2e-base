/*
* rwdImageMaps jQuery plugin v1.5
*
* Allows image maps to be used in a responsive design by recalculating the area coordinates to match the actual image size on load and window.resize
*
* Copyright (c) 2013 Matt Stow
* https://github.com/stowball/jQuery-rwdImageMaps
* http://mattstow.com
* Licensed under the MIT license
*/
define("plugin/jquery.imageMaps", ["jquery"], function() {

    $.fn.rwdImageMaps = function(lazyimg) {
        var $img = this;

        var getSrc = function($img){
            var src=  $img.attr('src') || $img.attr(lazyimg);
            //console.log(src);
            return src;
        };
        var rwdImageMap = function() {
            $img.each(function() {
                if (typeof($(this).attr('usemap')) == 'undefined')
                    return;

                var that = this,
                    $that = $(that);

                // Since WebKit doesn't know the height until after the image has loaded, perform everything in an onload copy
                $('<img />').load(function() {
                    //console.log(this);
                    var attrW = 'width',
                        attrH = 'height',
                        w = $that.attr(attrW),
                        h = $that.attr(attrH);

                    if (!w || !h) {
                        var temp = new Image();
                        temp.src = getSrc($that);
                        if (!w)
                            w = temp.width;
                        if (!h)
                            h = temp.height;
                    }

                   // console.log(w, h);

                    var wPercent = $that.width()/100,
                        hPercent = $that.height()/100,
                        map = $that.attr('usemap').replace('#', ''),
                        c = 'coords';

                    $('map[name="' + map + '"]').find('area').each(function() {
                        var $this = $(this);
                        if (!$this.data(c))
                            $this.data(c, $this.attr(c));

                        var coords = $this.data(c).split(','),
                            coordsPercent = new Array(coords.length);

                        for (var i = 0; i < coordsPercent.length; ++i) {
                            if (i % 2 === 0)
                                coordsPercent[i] = parseInt(((coords[i]/w)*100)*wPercent);
                            else
                                coordsPercent[i] = parseInt(((coords[i]/h)*100)*hPercent);
                        }
                        $this.attr(c, coordsPercent.toString());
                        
                    });

                }).attr('src', getSrc($that));
            });
        };
        $(window).resize(rwdImageMap);

        rwdImageMap();

        return this;
    };

});
