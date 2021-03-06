var _panes,
    _layout,
    _running,
    _stackWidth;

const VERTICAL = 'v';
const HORIZONTAL = 'h';

function run(paneElements, container) {
    const oldPanes = _panes || [];

    _panes = [];
    for (let i = 0; i < paneElements.length; i++) {
        let paneElem = paneElements[i];

        let pane = oldPanes.find(p => p.domElement.id == paneElem.id);

        if (!pane) {
            let isBase = (i == 0);
            // Use random string as ID
            paneElem.id = (new Date * Math.random()).toString(36);
            pane = new Pane(paneElem, isBase);
        }

        _panes[i] = pane;
    }

    if (!_running) {
        _layout = (window.innerWidth > 720)? HORIZONTAL : VERTICAL;
        _stackWidth = container.offsetWidth;

        window.addEventListener('resize', function(ev) {
            var prevLayout = _layout;

            _layout = (window.innerWidth > 720)? HORIZONTAL : VERTICAL;
            _stackWidth = container.offsetWidth;

            if (_layout != prevLayout) {
                // Layout changed! Reset and start new layout
                if (_layout == VERTICAL) {
                    resetVerticalLayout();
                }
                else {
                    resetHorizontalLayout();
                }
            }
        });
    }

    if (_layout == VERTICAL) {
        resetVerticalLayout();
    }
    else {
        _stackWidth = container.offsetWidth;
        resetHorizontalLayout();
    }
}

function stop() {
    var i;

    for (i = 0; i < _panes.length; i++) {
        _panes[i].stop();
    }

    // Stop updating
    _running = false;
}

function resetVerticalLayout() {
    var i, len = _panes.length;

    for (i = 0; i < len; i++) {
        var pane = _panes[i];

        pane.resetTransform();
        pane.setY(40 * i);
    }

    if (len > 2) {
        var animatedScrollTo = require('animated-scrollto');

        // Scroll down to show the topmost pane as well as the
        // header of the one underneith (vertically above) that.
        var scrollTop = (len - 2) * 40;
        setTimeout(function() {
            animatedScrollTo(document.body, scrollTop, 400);
        }, 70);
    }

    _running = false;
}

function resetHorizontalLayout() {
    var i, len = _panes.length;

    for (i = 0; i < len; i++) {
        var pane = _panes[i];

        pane.resetTransform();
    }

    if (_panes.length > 1) {
        var topPane = _panes[_panes.length-1];

        // Position top pane so that it's shown in it's entirety
        topPane.setX(_stackWidth - topPane.getWidth());

        // Distribute the remaining space to the left of the top pane
        // across all of the underlying panes (except the base pane).
        var perPane = topPane.getX() / (len - 1)
        i = len - 1;
        while (i-->1) {
            pane = _panes[i];
            pane.setX(i * perPane);
        }
    }

    // Start updating
    if (!_running) {
        _running = true;
        updateStack();
    }
}

function updateStack() {
    var i, len, shade, maxRight;

    if (!_running) {
        // The loop has been requested to stop. Bail
        // before doing anything and before requesting
        // a new animation frame.
        return;
    }

    len = _panes.length;
    for (i=0; i<len; i++) {
        _panes[i].update();
    }

    i=len;
    shade = 0.0;
    maxRight = _stackWidth;
    while (i-->0) {
        var section = _panes[i],
            sectionX = section.getX(),
            sectionWidth = section.getWidth();

        if (i > 0) {
            if (sectionX < (maxRight - sectionWidth)) {
                section.setX(maxRight - sectionWidth);
            }
            else if (sectionX > (maxRight - 30)) {
                section.setX(maxRight - 30);
            }
            else if (maxRight > 30 && sectionX < 0) {
                section.setX(0);
            }
        }

        shade -= 0.15 * (maxRight-sectionX)/sectionWidth;
        if (shade < 0)
            shade = 0;

        section.setShade(shade);

        shade += 0.2;
        maxRight = sectionX;
    }

    requestAnimationFrame(updateStack);
}



function Pane(domElement, isBase) {
    this.domElement = domElement;
    this.contentElement = domElement.getElementsByClassName('PaneBase-content')[0];
    this.shaderElement = document.createElement('div');
    this.shaderElement.className = isBase? 'RootPaneBase-shader' : 'PaneBase-shader';
    this.domElement.appendChild(this.shaderElement);
    this.dragging = false;
    this.isBase = isBase;

    var startX, originalX,
        dragging = false,
        section = this,
        prevX, speedX,
        axis;

    var x = 0;
    this.getX = function() {
        return x;
    }
    this.setX = function(val) {
        x = val;
        this.domElement.style.transform = 'translate3d('+x+'px,0,0)';
        this.domElement.style.webkitTransform = 'translate3d('+x+'px,0,0)';
    }

    var y = 0;
    this.getY = function() {
        return y;
    };
    this.setY = function(val) {
        this.domElement.style.top = val+'px';
        this.domElement.style.minHeight = 'calc(100vh - ' + val + 'px)';
    };

    var shade = 0;
    this.getShade = function() {
        return shade;
    }
    this.setShade = function(val) {
        shade = Math.max(0.0, Math.min(val, 1.0));
        this.shaderElement.style.backgroundColor = 'rgba(0,0,0,'+shade+')';
    }


    var w = this.domElement.offsetWidth;
    this.getWidth = function() {
        return w;
    }

    function startDragging(data) {
        axis = null;
        dragging = true;
        startX = data.pageX;
        prevX = startX;
        speedX = 0;
        originalX = section.getX();
    }

    function stopDragging() {
        dragging = false;
    }

    this.domElement.addEventListener('touchstart', onDomElementTouchStart);
    function onDomElementTouchStart(ev) {
        let x = ev.touches[0].clientX - domElement.getBoundingClientRect().left;
        if (_layout == HORIZONTAL && !section.isBase && x < 30) {
            startDragging(ev.touches[0]);
        }
    }

    this.domElement.addEventListener('mousedown', onDomElementMouseDown);
    function onDomElementMouseDown(ev) {
        let x = ev.clientX - domElement.getBoundingClientRect().left;
        if (_layout == HORIZONTAL && !section.isBase && x < 30) {
            startDragging(ev);
            ev.preventDefault();
            ev.stopImmediatePropagation();
        }
    }

    this.domElement.parentNode.addEventListener('mousemove', onDomElementMouseMove);
    function onDomElementMouseMove(ev) {
        if (dragging) {
            section.setX(originalX + (ev.pageX - startX));
            ev.preventDefault();
            ev.stopPropagation();
            ev.stopImmediatePropagation();
        }
    }

    this.domElement.parentNode.addEventListener('touchmove', onDomElementTouchMove);
    function onDomElementTouchMove(ev) {
        if (dragging) {
            var touch = ev.changedTouches[0],
                dx = touch.pageX - startX;

            speedX = (originalX + dx) - section.getX();
        }
    }

    document.addEventListener('touchend', stopDragging);
    document.addEventListener('mouseup', stopDragging);

    this.resetTransform = function() {
        this.domElement.style.top = '';
        this.domElement.style.transform = '';
        this.domElement.style.webkitTransform = '';

        stopDragging();
    }

    this.update = function() {
        if (speedX*speedX > 0.01) {
            section.setX(section.getX() + speedX);
            speedX *= 0.8;
        }
    }

    this.stop = function() {
        this.domElement.removeChild(this.shaderElement);
        this.domElement.parentNode.removeEventListener('touchmove', onDomElementTouchMove);
        this.domElement.parentNode.removeEventListener('mousemove', onDomElementMouseMove);
        this.domElement.removeEventListener('mousedown', onDomElementMouseDown);
        this.domElement.removeEventListener('touchstart', onDomElementTouchStart);

        document.removeEventListener('touchend', stopDragging);
        document.removeEventListener('mouseup', stopDragging);
    }
}

export default {
    run: run,
    stop: stop
};
