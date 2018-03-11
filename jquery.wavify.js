/*
*   Wavify
*   Jquery Plugin to make some nice waves
*   by peacepostman @ crezeo
 */
(function ( $ ) {

    $.fn.wavify = function( options ) {

        //  Options
        //
        //
        var settings = $.extend({
            container: options.container ? options.container : 'body',
            // Height of wave
            height: 200,
            // Amplitude of wave
            amplitude: 100,
            // Animation speed
            speed: .15,
            // Total number of articulation in wave
            bones: 3,
            // Color
            color: 'rgba(255,255,255, 0.20)',
            // 1: only top, 2: only bottom, 3: top and bottom
            mode: 1
        }, options );

        var wave = this,
            width = $(settings.container).width(),
            height = $(settings.container).height(),
            points = [],
            lastUpdate,
            totalTime = 0;

        //  Set color
        //
        TweenLite.set(wave, {attr:{fill: settings.color}});


        function topPoints(factor) {
            var points = [];

            for (var i = 0; i <= settings.bones; i++) {
                var x = i/settings.bones * width;
                var sinSeed = (factor + (i + i % settings.bones)) * settings.speed * 100;
                var sinHeight = Math.sin(sinSeed / 100) * settings.amplitude;
                var yPos = Math.sin(sinSeed / 100) * sinHeight  + settings.height;
                points.push({x: x, y: yPos});
            }

            return points;
        }

        function bottomPoints(factor) {
            var points = [];

            for (var i = settings.bones; i>= 0; i--) {
                var x = i/settings.bones * width;
                var _i = settings.bones - i;
                var sinSeed = (factor + (_i + _i % settings.bones)) * settings.speed * 100;
                var sinHeight = Math.sin(sinSeed / 100) * settings.amplitude;
                var yPos = Math.sin(sinSeed / 100) * sinHeight - settings.height - settings.amplitude + height;
                points.push({x: x, y: yPos});
            }

            return points;
        }

        function drawPaths(topPoints, bottomPoints) 
        {
            var SVGString = '';

            if(settings.mode == 1 || settings.mode == 3)
            {
                SVGString += 'M ' + topPoints[0].x + ' ' + topPoints[0].y;
                SVGString += drawPath(topPoints);
            }
            else
            {
                SVGString += 'M 0 0';
                SVGString += ' L ' + width + ' 0';
            }

            if(settings.mode == 1)
            {
                SVGString += ' L ' + width + ' ' + height;
                SVGString += ' L 0 ' + height + ' Z';
            }
            else
            {
                SVGString += ' L ' + bottomPoints[0].x + ' ' + bottomPoints[0].y;
                SVGString += drawPath(bottomPoints, width);
                SVGString += ' Z';
            }

            return SVGString;
        }

        function drawPath(points, offset = 0)
        {
            var SVGString = '';

            var cp0 = {
                x: offset + (points[1].x - points[0].x) / 2,
                y: (points[1].y - points[0].y) + points[0].y + (points[1].y - points[0].y)
            };

            SVGString += ' C ' + cp0.x + ' ' + cp0.y + ' ' + cp0.x + ' ' + cp0.y + ' ' + points[1].x + ' ' + points[1].y;

            var prevCp = cp0;
            var inverted = -1;

            for (var i = 1; i < points.length-1; i++) {
                var cpLength = Math.sqrt(prevCp.x * prevCp.x + prevCp.y * prevCp.y);
                var cp1 = {
                    x: (points[i].x - prevCp.x) + points[i].x,
                    y: (points[i].y - prevCp.y) + points[i].y
                };

                SVGString += ' C ' + cp1.x + ' ' + cp1.y + ' ' + cp1.x + ' ' + cp1.y + ' ' + points[i+1].x + ' ' + points[i+1].y;
                prevCp = cp1;
                inverted = -inverted;
            }

            return SVGString;
        }

        //  Draw function
        //
        //
        function draw() {
            var now = window.Date.now();

            if (lastUpdate) {
                var elapsed = (now-lastUpdate) / 1000;
                lastUpdate = now;

                totalTime += elapsed;

                var factor = totalTime*Math.PI;
                TweenMax.to(wave, settings.speed, {
                    attr:{
                        d: drawPaths(topPoints(factor), bottomPoints(factor))
                    },
                    ease: Power1.easeInOut
                });

            } else {
                lastUpdate = now;
            }

            requestAnimationFrame(draw);
        }

        //  Pure js debounce function to optimize resize method
        //
        //
        function debounce(func, wait, immediate) {
            var timeout;
            return function() {
                var context = this, args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                }, wait);
                if (immediate && !timeout) func.apply(context, args);
            };
        }

        //  Redraw for resize with debounce
        //
        var redraw = debounce(function() {
            wave.attr('d', '');
            points = [];
            totalTime = 0;
            width = $(settings.container).width();
            height = $(settings.container).height();
            lastUpdate = false;
            setTimeout(function(){
                draw();
            }, 50);
        }, 250);
        $(window).on('resize', redraw);


        //  Execute
        //
        return draw();

    };

}(jQuery));