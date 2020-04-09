const Line = function(__sticksCount) {
  let appTime = 0;

  let sticksCount = __sticksCount;

  let HEIGHT = 0;
  let WIDTH = 0;
  let didUpdate = false;
  let pointer = 0;

  const wrapperContainer = document.querySelector('.lineslider');
  let c = {};
  let canvas = null;

  let elementWidth;

  this.ticks = new Array(sticksCount).fill(null).map((_, index) => {
    let heightTop = 68,
      heightBottom = HEIGHT - 66;

    return {
      heightTop: {
        shouldUpdate: false,
        value: heightTop,
        fromValue: heightTop,
        toValue: heightTop,
        animationStart: 0,
        duration: 200,
      },
      heightBottom: {
        shouldUpdate: false,
        value: heightBottom,
        fromValue: heightBottom,
        toValue: heightBottom,
        animationStart: 0,
        duration: 200,
      },
      opacity: {
        shouldUpdate: false,
        value: 0.3,
        fromValue: 0.3,
        toValue: 0.3,
        animationStart: 0,
        duration: 200,
      },
    };
  });

  let ctx = null;

  const drawLines = () => {
    ctx.strokeStyle = '#2fdf03';

    this.ticks.forEach((item, index) => {
      ctx.beginPath();

      ctx.lineWidth = 2;
      ctx.globalAlpha = item.opacity.value;

      let left = elementWidth * index;

      let leftPadding = elementWidth / 2;
      ctx.moveTo(left + leftPadding, item.heightTop.value);
      ctx.lineTo(left + leftPadding, item.heightBottom.value);

      ctx.stroke();
    });
  };

  this.reInit = function(__sticksCount) {
    wrapperContainer.innerHTML = null;
    canvas = document.createElement('canvas');

    wrapperContainer.appendChild(canvas);

    const c = wrapperContainer.getBoundingClientRect();

    HEIGHT = c.height;
    WIDTH = c.width;

    canvas.width = WIDTH;
    canvas.style.width = WIDTH + 'px';
    canvas.style.height = HEIGHT + 'px';

    sticksCount = __sticksCount;
    elementWidth = WIDTH / sticksCount;

    ctx = canvas.getContext('2d');

    this.ticks = new Array(sticksCount).fill(null).map((_, index) => {
      let heightTop = 68,
        heightBottom = HEIGHT - 66;

      return {
        heightTop: {
          shouldUpdate: false,
          value: heightTop,
          fromValue: heightTop,
          toValue: heightTop,
          animationStart: 0,
          duration: 200,
        },
        heightBottom: {
          shouldUpdate: false,
          value: heightBottom,
          fromValue: heightBottom,
          toValue: heightBottom,
          animationStart: 0,
          duration: 200,
        },
        opacity: {
          shouldUpdate: false,
          value: 0.3,
          fromValue: 0.3,
          toValue: 0.3,
          animationStart: 0,
          duration: 200,
        },
      };
    });

    didUpdate = true;
  };

  this.setCursorPointer = function(_pointer) {
    pointer = _pointer;

    const elementLeftRange = pointer - elementWidth / 2 + elementWidth;
    const elementRightRange = pointer + elementWidth / 2 - elementWidth;

    for (let i = 0; i < this.ticks.length; i++) {
      let left = elementWidth * i;

      let __toValueTop = 74,
        __toValueBottom = HEIGHT - 34,
        __toValueOpacity = 0.3;

      if (i % 11 === 5) {
        __toValueTop = 58;
        __toValueBottom = HEIGHT - 20;
        __toValueOpacity = 0.3;
      }

      if (
        elementLeftRange - elementWidth * 8 < left &&
        elementRightRange + elementWidth * 8 > left
      ) {
        __toValueTop = 70;
        __toValueBottom = HEIGHT - 18;
        __toValueOpacity = 0.5;
      }

      if (
        elementLeftRange - elementWidth * 7 < left &&
        elementRightRange + elementWidth * 7 > left
      ) {
        __toValueTop = 80;
        __toValueBottom = HEIGHT - 4;
        __toValueOpacity = 0.7;
      }

      if (
        elementLeftRange - elementWidth * 6 < left &&
        elementRightRange + elementWidth * 6 > left
      ) {
        __toValueTop = 74;
        __toValueBottom = HEIGHT - 14;
        __toValueOpacity = 0.7;
      }

      if (
        elementLeftRange - elementWidth * 5 < left &&
        elementRightRange + elementWidth * 5 > left
      ) {
        __toValueTop = 64;
        __toValueBottom = HEIGHT - 24;
        __toValueOpacity = 1;
      }

      if (
        elementLeftRange - elementWidth * 4 < left &&
        elementRightRange + elementWidth * 4 > left
      ) {
        __toValueTop = 52;
        __toValueBottom = HEIGHT - 32;
        __toValueOpacity = 1;
      }

      if (
        elementLeftRange - elementWidth * 3 < left &&
        elementRightRange + elementWidth * 3 > left
      ) {
        __toValueTop = 34;
        __toValueBottom = HEIGHT - 48;
        __toValueOpacity = 1;
      }

      if (
        elementLeftRange - elementWidth * 2 < left &&
        elementRightRange + elementWidth * 2 > left
      ) {
        __toValueTop = 16;
        __toValueBottom = HEIGHT - 60;
        __toValueOpacity = 1;
      }

      if (
        elementLeftRange - elementWidth < left &&
        elementRightRange + elementWidth > left
      ) {
        __toValueTop = 4;
        __toValueBottom = HEIGHT - 60;
        __toValueOpacity = 1;
      }

      if (this.ticks[i].heightTop.toValue !== __toValueTop) {
        this.ticks[i].heightTop.toValue = __toValueTop;
        this.ticks[i].heightTop.fromValue = this.ticks[i].heightTop.value;
        this.ticks[i].heightTop.animationStart = appTime;
        this.ticks[i].heightTop.shouldUpdate = true;
      }

      if (this.ticks[i].heightBottom.toValue !== __toValueBottom) {
        this.ticks[i].heightBottom.toValue = __toValueBottom;
        this.ticks[i].heightBottom.fromValue = this.ticks[i].heightBottom.value;
        this.ticks[i].heightBottom.animationStart = appTime;
        this.ticks[i].heightBottom.shouldUpdate = true;
      }

      if (this.ticks[i].opacity.toValue !== __toValueOpacity) {
        this.ticks[i].opacity.toValue = __toValueOpacity;
        this.ticks[i].opacity.shouldUpdate = true;
        this.ticks[i].opacity.animationStart = appTime;
      }
    }

    didUpdate = true;
  };

  let that = this;
  function render(time) {
    appTime = time;

    if (didUpdate) {
      didUpdate = false;

      var c = canvas.getBoundingClientRect();
      HEIGHT = c.height;
      WIDTH = c.width;

      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      for (let i = 0; i < that.ticks.length; i++) {
        if (that.ticks[i].heightTop.shouldUpdate) {
          const a = animate(that.ticks[i].heightTop);
          if (a === 'didEnd') {
            that.ticks[i].heightTop.shouldUpdate = false;
          } else {
            that.ticks[i].heightTop.value = a;
          }

          didUpdate = true;
        }

        if (that.ticks[i].heightBottom.shouldUpdate) {
          const a = animate(that.ticks[i].heightBottom);

          if (a === 'didEnd') {
            that.ticks[i].heightBottom.shouldUpdate = false;
          } else {
            that.ticks[i].heightBottom.value = a;
          }

          didUpdate = true;
        }

        if (that.ticks[i].opacity.shouldUpdate) {
          const a = animate(that.ticks[i].opacity);

          if (a === 'didEnd') {
            that.ticks[i].opacity.shouldUpdate = false;
          } else {
            that.ticks[i].opacity.value = a;
          }

          didUpdate = true;
        }
      }

      drawLines();
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  function animate(item) {
    if (item.toValue === item.value) {
      return 'didEnd';
    }

    var timeDiff = appTime - item.animationStart;

    if (item.delay) timeDiff -= item.delay;

    var progress = timeDiff / item.duration;
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;

    var ease = -progress * (progress - 2);

    return item.fromValue + (item.toValue - item.fromValue) * ease;
  }
};

export default Line;
