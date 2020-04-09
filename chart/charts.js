export function CSChart(initialData) {
  var colorScheme = {
    mainColor: '#fff',
    scrollBackground: '#E2EEF9',
    scrollSelect: '#C0D1E1',
    linesColor: '#34373A',
    yTextColor: '#FBF7F7',
    xTextColor: '#FBF7F7',
    yTextAlpha: 0.6,
    xTextAlpha: 0.6,
  };

  const closestNumber = (array, item) => {
    let current = null,
      closestLeft = 0;
    for (var i = 0; i < array.length; i++) {
      current = array[i];
      if (
        current < item &&
        (typeof closestLeft === 'undefined' || closestLeft < current)
      ) {
        closestLeft = current;
      }
    }

    return closestLeft;
  };

  var chartsContainer = document.getElementById('charts--container');

  let __existedWrapper = chartsContainer.querySelector('.wrapper');

  if (__existedWrapper) {
    chartsContainer.removeChild(__existedWrapper);
  }

  var wrapper = document.createElement('div');
  wrapper.classList.add('wrapper');

  var sellBetIcon = chartsContainer.querySelector('.chart-bet--sell');
  var buyBetIcon = chartsContainer.querySelector('.chart-bet--buy');

  chartsContainer.appendChild(wrapper);

  var canvas = document.createElement('canvas');

  wrapper.appendChild(canvas);

  var ctx = canvas.getContext('2d');

  var dpx = window.devicePixelRatio;

  var FONT = 12 * dpx + 'px Montserrat';

  var HEIGHT = 0;
  var WIDTH = 0;
  var PREVIEW_PT = 30 * dpx;
  var X_TEXT_PT = 15 * dpx;
  var Y_LABELS_OFFSET = 64 * dpx;
  var Y_LABELS_TP = 20 * dpx;
  var Y_LABELS_BP = 6 * dpx;

  var canvasBounds = {};

  var xAxis = null;
  var yAxis = null;

  var appTime = 0;

  var chartHeight = 0 * dpx;
  var yLegendLabelsCount = 1 * dpx;

  var didUpdate = true;

  var mouseY = 0;
  var mouseX = 0;
  var mouseEvent = 'NONE';

  this.destroy = function() {};

  this.updateValue = function({ k }) {
    const _x = yAxis.columns[yAxis.columns.length - 1];

    yAxis.columns[yAxis.columns.length - 1] = {
      ...yAxis.columns[yAxis.columns.length - 1],
      shouldUpdate: true,
      animates: {
        max: {
          shouldUpdate: true,
          duration: 200,
          toValue: k.h,
          fromValue: yAxis.columns[yAxis.columns.length - 1].max,
          value: yAxis.columns[yAxis.columns.length - 1].max,
          animationStart: appTime,
        },
        min: {
          shouldUpdate: true,
          duration: 200,
          toValue: k.l,
          fromValue: yAxis.columns[yAxis.columns.length - 1].min,
          value: yAxis.columns[yAxis.columns.length - 1].min,
          animationStart: appTime,
        },
        open: {
          shouldUpdate: true,
          duration: 200,
          toValue: k.o,
          fromValue: yAxis.columns[yAxis.columns.length - 1].open,
          value: yAxis.columns[yAxis.columns.length - 1].open,
          animationStart: appTime,
        },
        close: {
          shouldUpdate: true,
          duration: 200,
          toValue: k.c,
          fromValue: yAxis.columns[yAxis.columns.length - 1].close,
          value: yAxis.columns[yAxis.columns.length - 1].close,
          animationStart: appTime,
        },
      },
    };

    if (_x.open != k.o) {
      yAxis.columns.push({
        min: Number(k.l),
        max: Number(k.h),
        open: Number(k.o),
        close: Number(k.c),
      });
    }

    yAxis.animateNewValue();
  };

  this.openOrder = function(order, index) {
    yAxis.openOrder(order, index);
  };

  this.closeOrder = function(orderId, type) {
    yAxis.closeOrder(orderId, type);
  };

  setInitialData();

  function onMouseWheel(e) {
    let __mouseX = mouseX + canvasBounds.left;

    if (
      __mouseX > canvasBounds.left &&
      __mouseX < canvasBounds.right &&
      mouseY < HEIGHT &&
      mouseY > 0
    ) {
      e.preventDefault();

      xAxis.zoomCenter(e.deltaY);
      yAxis.setLowAndTop();
      didUpdate = true;
    }
  }

  var newMouseX = 0,
    newMouseY = 0;

  function onMouseMove(e) {
    newMouseX = e.clientX - canvasBounds.left;

    if (
      newMouseX > 0 &&
      newMouseX < canvasBounds.width &&
      mouseY > 0 &&
      mouseY < chartHeight + X_TEXT_PT
    ) {
      xAxis.setHovered(newMouseX, mouseY);
    } else {
      if (xAxis.hovered) {
        xAxis.setHovered(null);
      }
    }

    if (mouseEvent === 'DRAG') {
      xAxis.onDrag(
        xAxis.currentLeftPositionPx + ((mouseX - newMouseX) / (xAxis.labels.length / 100)) * 1
      );
    }

    if (mouseEvent !== 'NONE') {
      yAxis.setLowAndTop();
      didUpdate = true;
    }

    mouseX = e.clientX - canvasBounds.left;
    mouseY = e.clientY - canvasBounds.top;
  }

  const onMouseDown = function(e) {
    newMouseX = mouseX = e.clientX - canvasBounds.left;
    newMouseY = mouseY = e.clientY - canvasBounds.top;

    let __mouseX = mouseX + canvasBounds.left;

    if (
      mouseY > 0 &&
      mouseY < HEIGHT &&
      __mouseX > canvasBounds.left &&
      __mouseX < canvasBounds.right
    ) {
      mouseEvent = 'DRAG';
    }
  };

  function onMouseUp() {
    mouseEvent = 'NONE';
    if (xAxis.hovered) {
      xAxis.setHovered(null);
    }
  }

  document.addEventListener('mousemove', onMouseMove);

  document.addEventListener('wheel', onMouseWheel, { passive: false });

  document.addEventListener('mousedown', onMouseDown);

  document.addEventListener('touchstart', function(e) {
    onMouseDown(e.touches[0]);
  });

  document.addEventListener('touchmove', function(e) {
    return onMouseMove(e.touches[0]);
  });

  document.addEventListener('mouseup', onMouseUp);

  document.addEventListener('touchend', onMouseUp);
  document.addEventListener('touchcancel', onMouseUp);

  function setInitialData() {
    var c = canvas.getBoundingClientRect();

    WIDTH = c.width * dpx;
    HEIGHT = c.height * dpx;

    canvasBounds = c;

    canvas.setAttribute('width', WIDTH);
    canvas.setAttribute('height', HEIGHT);

    chartHeight = HEIGHT - PREVIEW_PT;
    yLegendLabelsCount = chartHeight / Y_LABELS_OFFSET;

    if (yLegendLabelsCount < 1) {
      yLegendLabelsCount = 1;
    }

    const x = [],
      y = [];

    initialData.forEach((item) => {
      x.push(item.time);
      y.push({
        min: item.low,
        max: item.hight,
        open: item.open,
        close: item.close,
      });
    });

    xAxis = new AxisX();

    let xLength = 40 - x.length;

    if (xLength > 0) {
      xAxis.beforeCount = xLength;
      while (xLength > 0) {
        x.push(x[x.length - 1] + 15000);
        xLength--;
      }
    }

    xAxis.setDifference(x);
    xAxis.setInitialPosition();

    yAxis = new AxisY();
    yAxis.setInitialData(y);
  }

  let prevAnimateValue = 0;

  function render(time) {
    var c = canvas.getBoundingClientRect();

    canvasBounds = c;

    ctx.font = FONT;

    appTime = time;

    if (WIDTH !== c.width * dpx || HEIGHT !== c.height * dpx) {
      WIDTH = c.width * dpx;
      HEIGHT = c.height * dpx;

      chartHeight = HEIGHT - PREVIEW_PT;

      canvas.setAttribute('width', WIDTH);
      canvas.setAttribute('height', HEIGHT);

      ctx.font = FONT;

      xAxis.resize();
      xAxis.setInitialPosition();
      yAxis.setLowAndTop();
      yAxis.setScaleRatio();

      didUpdate = true;
    }

    if (!yAxis.didFirstRender) {
      yAxis.setLowAndTop(true);
      yAxis.setScaleRatio();

      yAxis.didFirstRender = true;
    }

    const currentTime = +new Date();

    const lastStick =
      xAxis.labels[xAxis.labels.length - 1 - xAxis.plusCount] + 15000;

    const value = (currentTime - lastStick) * -1;

    if (value >= 0) {
      if (prevAnimateValue === 0) {
        prevAnimateValue = value;
      } else {
        const stepValue = (value - prevAnimateValue) * -1;
        prevAnimateValue = value;

        if (stepValue > 0) {
          xAxis.rightAbsoluteTsLimit += stepValue;
          xAxis.tsAbsoluteDifference =
            xAxis.rightAbsoluteTsLimit - xAxis.labels[0];

          xAxis.setScaleRatio();

          xAxis.setCurrentDiff(
            xAxis.currentLeftPositionPx,
            xAxis.currentRightPositionPx
          );
        }
      }
    } else {
      if (xAxis.beforeCount > 0) {
        xAxis.beforeCount -= 1;
      } else {
        xAxis.labels.push(xAxis.labels[xAxis.labels.length - 1] + 15 * 1000);
      }
    }

    if (didUpdate) {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      didUpdate = false;

      yAxis.preRender();

      yAxis.renderLegendLines();
      xAxis.render();

      xAxis.renderHoveredItem();
      xAxis.renderStartEndBet();

      ctx.setLineDash([0, 0]);

      drawBarStackedChart(
        xAxis.currentDiffLeftPositionIndex,
        xAxis.currentDiffRightPositionIndex,
        xAxis.currentDiffScale,
        xAxis.currentDiffOffset,
        yAxis.scale,
        yAxis.offset
      );

      yAxis.drawPointer();

      yAxis.drawBets();

      xAxis.renderStartEndText();

      yAxis.renderLegendTexts();

      yAxis.renderPointerNumber();
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  function drawBarStackedChart(
    start,
    end,
    xScaleRatio,
    xOffset,
    yScaleRatio,
    yOffset
  ) {
    for (var i = start; i < end; i++) {
      if (!yAxis.columns[i]) continue;

      const open = yAxis.columns[i].open,
        close = yAxis.columns[i].close;

      var x = xAxis.labels[i];
      var y = 0,
        yMin = 0;

      let color = '#2FDF03';

      if (yAxis.columns[i - 1] && yAxis.columns[i - 1].close > close) {
        color = '#E91E63';
      }

      if (open >= close) {
        (y = open), (yMin = close);
      } else {
        (y = close), (yMin = open);
      }

      var hight = yAxis.columns[i].max,
        low = yAxis.columns[i].min;

      var shadowHightTop = timeStampToPX(hight, yScaleRatio, yOffset);
      var shadowLowBottom = timeStampToPX(low, yScaleRatio, yOffset);
      var _v = timeStampToPX(y, yScaleRatio, yOffset);
      var _vMin = timeStampToPX(yMin, yScaleRatio, yOffset);
      var _x = timeStampToPX(x, xScaleRatio, xOffset);

      const padding = xAxis.stepTsDiff * xScaleRatio * 0.1;

      const fullWidth = _x + xAxis.stepTsDiff * xScaleRatio;
      const rightPadding = fullWidth - padding;

      const leftPadding = padding + _x;

      const shadowStart = xAxis.stepTsDiff * 0.49,
        shadowPaddingLeft = xAxis.stepTsDiff * 0.51;

      const shadowXStart = _x + shadowStart * xScaleRatio,
        shadowEnd = _x + shadowPaddingLeft * xScaleRatio;

      ctx.beginPath();

      ctx.globalAlpha = 1;
      ctx.fillStyle = color;

      ctx.lineTo(shadowXStart, _v);
      ctx.lineTo(shadowXStart, shadowHightTop);
      ctx.lineTo(shadowEnd, shadowHightTop);
      ctx.lineTo(shadowEnd, _v);

      ctx.fill();

      ctx.beginPath();

      ctx.globalAlpha = 1;
      ctx.fillStyle = color;

      ctx.lineTo(shadowXStart, _vMin);
      ctx.lineTo(shadowXStart, shadowLowBottom);
      ctx.lineTo(shadowEnd, shadowLowBottom);
      ctx.lineTo(shadowEnd, _vMin);

      ctx.fill();

      ctx.beginPath();
      ctx.globalAlpha = 1;
      ctx.fillStyle = color;

      ctx.lineTo(leftPadding, _vMin);
      ctx.lineTo(leftPadding, _v);
      ctx.lineTo(rightPadding, _v);
      ctx.lineTo(rightPadding, _vMin);

      ctx.fill();
    }
  }

  function AxisY() {
    this.didFirstRender = false;

    this.columns = [];

    this.top = {
      value: 0,
      toValue: 0,
      fromValue: 0,
      duration: 0,
      shouldUpdate: false,
    };

    this.low = {
      value: 0,
      toValue: 0,
      fromValue: 0,
      duration: 0,
      shouldUpdate: false,
    };

    this.scale = 1;
    this.offset = 1;

    this.currentTextLow = 1;
    this.currentTextTop = 2;

    this.bets = [];

    this.currentTextOpacity = {
      value: 1,
      toValue: 1,
      fromValue: 1,
      duration: 0,
      shouldUpdate: false,
    };

    this.prevTextOpacity = {
      value: 0,
      toValue: 0,
      fromValue: 0,
      duration: 0,
      shouldUpdate: false,
    };

    this.animatatedTextDelta = {
      value: 0,
      toValue: 0,
      fromValue: 0,
      duration: 0,
      shouldUpdate: false,
    };

    this.animatatedCurrentTextDelta = {
      value: 0,
      toValue: 0,
      fromValue: 0,
      duration: 0,
      shouldUpdate: false,
    };

    this.setInitialData = function(columns) {
      this.columns = columns;
    };

    this.setLowAndTop = function(withoutAnimation) {
      var lowTop = this.calculateLowTop(this, withoutAnimation);
      this.handleLegendLabelsPosition(
        lowTop.newTopValue,
        lowTop.newLowValue,
        this
      );
    };

    this.preRender = function() {
      this.animateLowAndTop(this);
      this.animateText(this);
      this.animateNewValue();
    };

    this.handleLegendLabelsPosition = function(newTopValue, newLowValue, obj) {
      var newDiff = newTopValue - newLowValue;
      var oldDiff = obj.currentTextTop - obj.currentTextLow;

      if (
        oldDiff !== newDiff ||
        newLowValue !== obj.currentTextLow ||
        newTopValue !== obj.currentTextTop
      ) {
        obj.currentTextLow = newLowValue;
        obj.currentTextTop = newTopValue;

        if (
          !obj.animatatedTextDelta.shouldUpdate ||
          !obj.animatatedCurrentTextDelta.shouldUpdate
        ) {
          if (newDiff > oldDiff) {
            obj.animatatedTextDelta = {
              value: 0,
              fromValue: 0,
              toValue: (Y_LABELS_OFFSET + Y_LABELS_BP + Y_LABELS_TP) * 2,
              shouldUpdate: true,
              duration: 300,
              animationStart: appTime,
            };

            obj.animatatedCurrentTextDelta = {
              value: -Y_LABELS_OFFSET - Y_LABELS_BP,
              fromValue: -Y_LABELS_OFFSET - Y_LABELS_BP - Y_LABELS_TP,
              toValue: 0,
              shouldUpdate: true,
              duration: 300,
              animationStart: appTime,
            };
          } else {
            obj.animatatedTextDelta = {
              value: 0,
              fromValue: 0,
              toValue: (-Y_LABELS_OFFSET - Y_LABELS_BP - Y_LABELS_TP) * 2,
              shouldUpdate: true,
              duration: 300,
              animationStart: appTime,
            };

            obj.animatatedCurrentTextDelta = {
              value: Y_LABELS_OFFSET + Y_LABELS_BP,
              fromValue: Y_LABELS_TP + Y_LABELS_OFFSET + Y_LABELS_BP,
              toValue: 0,
              shouldUpdate: true,
              duration: 300,
              animationStart: appTime,
            };
          }

          obj.prevTextOpacity = {
            value: colorScheme.yTextAlpha,
            fromValue: colorScheme.yTextAlpha,
            toValue: 0,
            shouldUpdate: true,
            duration: 200,
            animationStart: appTime,
          };
          obj.currentTextOpacity = {
            value: 0,
            fromValue: 0,
            toValue: colorScheme.yTextAlpha,
            shouldUpdate: true,
            duration: 300,
            animationStart: appTime,
          };
        }
      }

      return obj;
    };

    this.animateNewValue = function() {
      const currentItem = this.columns[this.columns.length - 1];

      if (currentItem.animates) {
        for (let item in currentItem.animates) {
          const __item = currentItem.animates[item];

          if (__item.shouldUpdate) {
            const animatedItem = this.animate(__item);
            if (animatedItem === 'didEnd') __item.shouldUpdate = false;
            else {
              __item.value = animatedItem;

              this.columns[this.columns.length - 1].animates[item] = __item;
              this.columns[this.columns.length - 1][item] = animatedItem;
            }
          }
        }

        didUpdate = true;
        this.calculateLowTop();
      }
    };

    this.calculateLowTop = function(obj, withoutAnimation) {
      if (!obj) obj = this;

      var _low = 'low';
      var _top = 'top';
      var leftLimit = xAxis.currentDiffLeftPositionIndex;
      var rightLimit = xAxis.currentDiffRightPositionIndex;

      var newTopValue = -Infinity;
      var newLowValue = Infinity;

      var column = this.columns;

      for (var i = leftLimit; i < rightLimit; i++) {
        var y = column[i];

        if (!y) continue;
        if (y.min < newLowValue) newLowValue = y.min;
        if (y.max > newTopValue) newTopValue = y.max;
      }

      if (withoutAnimation) {
        obj[_low].value = newLowValue;
        obj[_top].value = newTopValue;
        obj[_low].fromValue = newLowValue;
        obj[_top].fromValue = newTopValue;
      } else {
        if (newLowValue !== obj[_low].value) {
          obj[_low] = {
            value: obj[_low].value,
            fromValue: obj[_low].value,
            toValue: newLowValue,
            shouldUpdate: true,
            duration: 300,
            animationStart: appTime,
          };
        }

        if (newTopValue !== obj[_top].value) {
          obj[_top] = {
            value: obj[_top].value,
            fromValue: obj[_top].value,
            toValue: newTopValue,
            shouldUpdate: true,
            duration: 300,
            animationStart: appTime,
          };
        }
      }

      return { obj: obj, newLowValue: newLowValue, newTopValue: newTopValue };
    };

    this.setScaleRatio = function(obj) {
      if (!obj) obj = this;

      var labelsDiff = obj.top.value - obj.low.value;

      obj.scale = -(chartHeight - Y_LABELS_TP) / labelsDiff;
      obj.offset = chartHeight - obj.low.value * obj.scale;

      return obj;
    };

    this.animateLowAndTop = function(obj) {
      if (obj.low.shouldUpdate) {
        var a = this.animate(obj.low);
        a === 'didEnd' ? (obj.low.shouldUpdate = false) : (obj.low.value = a);
        this.setScaleRatio(obj);
        didUpdate = true;
      }

      if (obj.top.shouldUpdate) {
        var a = this.animate(obj.top);
        a === 'didEnd' ? (obj.top.shouldUpdate = false) : (obj.top.value = a);
        this.setScaleRatio(obj);
        didUpdate = true;
      }
    };

    this.animateText = function(obj) {
      if (obj.animatatedTextDelta.shouldUpdate) {
        var a = this.animate(obj.animatatedTextDelta);

        if (a === 'didEnd') obj.animatatedTextDelta.shouldUpdate = false;
        else obj.animatatedTextDelta.value = a;

        didUpdate = true;
      }

      if (obj.animatatedCurrentTextDelta.shouldUpdate) {
        var a = this.animate(obj.animatatedCurrentTextDelta);

        if (a === 'didEnd') obj.animatatedCurrentTextDelta.shouldUpdate = false;
        else obj.animatatedCurrentTextDelta.value = a;

        didUpdate = true;
      }

      if (obj.currentTextOpacity.shouldUpdate) {
        var a = this.animate(obj.currentTextOpacity);

        if (a === 'didEnd') obj.currentTextOpacity.shouldUpdate = false;
        else obj.currentTextOpacity.value = a;

        didUpdate = true;
      }

      if (obj.prevTextOpacity.shouldUpdate) {
        var a = this.animate(obj.prevTextOpacity);

        if (a === 'didEnd') obj.prevTextOpacity.shouldUpdate = false;
        else obj.prevTextOpacity.value = a;

        didUpdate = true;
      }
    };

    this.renderLegendTexts = function() {
      const RIGHT_PADDING = 60 * dpx;

      ctx.beginPath();

      ctx.globalAlpha = 1;
      ctx.fillStyle = '#2F3136';

      ctx.lineTo(WIDTH - 10 * dpx - RIGHT_PADDING, 0);
      ctx.lineTo(WIDTH, 0);
      ctx.lineTo(WIDTH, HEIGHT);
      ctx.lineTo(WIDTH - 10 * dpx - RIGHT_PADDING, HEIGHT);

      ctx.fill();

      var oldLabelsDiff = this.top.fromValue - this.low.fromValue;
      var textDelta = Math.floor(
        oldLabelsDiff / Math.floor(yLegendLabelsCount)
      );
      var oldTextScale = -(chartHeight - Y_LABELS_TP) / oldLabelsDiff;
      var oldTextOffset = chartHeight - this.low.fromValue * oldTextScale;

      var newLabelsDiff = this.currentTextTop - this.currentTextLow;
      var newTextDelta = Math.floor(
        newLabelsDiff / Math.floor(yLegendLabelsCount)
      );

      var xOffset = 0;

      xOffset = WIDTH - RIGHT_PADDING;

      for (var i = 0; i < yLegendLabelsCount; i++) {
        var newLabelValue = this.currentTextLow + newTextDelta * i;
        var newY = this.low.fromValue + textDelta * i;
        var newYInPx = timeStampToPX(newY, oldTextScale, oldTextOffset);
        newYInPx += this.animatatedCurrentTextDelta.value;
        var newFormatedLabel = this.formatNumber(newLabelValue, true);

        ctx.fillStyle = colorScheme.yTextColor;

        ctx.globalAlpha = this.currentTextOpacity.value;

        if (newFormatedLabel && newFormatedLabel !== 'NaN') {
          ctx.fillText(
            newFormatedLabel.toFixed(3),
            xOffset,
            newYInPx - Y_LABELS_BP
          );
        }

        if (this.prevTextOpacity.value === 0) {
          continue;
        }

        var oldLabelValue = this.low.fromValue + textDelta * i;
        var oldY = this.low.fromValue + textDelta * i;
        var oldYInPx = timeStampToPX(oldY, oldTextScale, oldTextOffset);
        oldYInPx += this.animatatedTextDelta.value;
        var oldFormatedLabel = this.formatNumber(oldLabelValue, true);

        ctx.globalAlpha = this.prevTextOpacity.value;
        ctx.fillText(oldFormatedLabel, xOffset, oldYInPx - Y_LABELS_BP);
      }
    };

    this.renderLegendLines = function() {
      var oldLabelsDiff = this.top.fromValue - this.low.fromValue;
      var textDelta = Math.floor(
        oldLabelsDiff / Math.floor(yLegendLabelsCount)
      );
      var oldTextScale = -(chartHeight - Y_LABELS_TP) / oldLabelsDiff;
      var oldTextOffset = chartHeight - this.low.fromValue * oldTextScale;

      for (var i = 0; i < yLegendLabelsCount; i++) {
        var newY = this.low.fromValue + textDelta * i;
        var newYInPx = timeStampToPX(newY, oldTextScale, oldTextOffset);
        newYInPx += this.animatatedCurrentTextDelta.value;

        ctx.fillStyle = colorScheme.yTextColor;

        ctx.globalAlpha = this.currentTextOpacity.value;

        ctx.globalAlpha = ctx.globalAlpha / 10;
        this.drawLine(i, newYInPx);

        if (this.prevTextOpacity.value === 0) {
          continue;
        }

        var oldY = this.low.fromValue + textDelta * i;
        var oldYInPx = timeStampToPX(oldY, oldTextScale, oldTextOffset);
        oldYInPx += this.animatatedTextDelta.value;

        ctx.globalAlpha = this.prevTextOpacity.value;

        ctx.globalAlpha = ctx.globalAlpha / 10;
        this.drawLine(i, oldYInPx);
      }
    };

    this.renderPointerNumber = function() {
      const lastItem = this.columns[this.columns.length - 1];

      const value = lastItem.close;
      var valueInPx = timeStampToPX(value, this.scale, this.offset);

      ctx.beginPath();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#000';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;

      ctx.lineTo(WIDTH - 60 * dpx, valueInPx + 12 * dpx);
      ctx.lineTo(WIDTH - 2 * dpx, valueInPx + 12 * dpx);
      ctx.lineTo(WIDTH - 2 * dpx, valueInPx - 12 * dpx);
      ctx.lineTo(WIDTH - 60 * dpx, valueInPx - 12 * dpx);
      ctx.lineTo(WIDTH - 60 * dpx, valueInPx + 12 * dpx);

      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fff';

      ctx.fillText(value.toFixed(3), WIDTH - 55 * dpx, valueInPx + 4 * dpx);
    };

    this.drawPointer = function() {
      const lastItem = this.columns[this.columns.length - 1];

      const value = lastItem.close;

      const position = xAxis.labels[this.columns.length - 1];

      var valueInPx = timeStampToPX(value, this.scale, this.offset);
      var _x = timeStampToPX(
        position,
        xAxis.currentDiffScale,
        xAxis.currentDiffOffset
      );
      var diffInPx = (xAxis.stepTsDiff * xAxis.currentDiffScale) / 2;

      ctx.beginPath();

      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff';

      ctx.lineTo(_x + diffInPx - 4 * dpx, valueInPx);
      ctx.lineTo(diffInPx + _x, valueInPx + 4 * dpx);
      ctx.lineTo(diffInPx + _x + 4 * dpx, valueInPx);
      ctx.lineTo(diffInPx + _x, valueInPx - 4 * dpx);

      ctx.fill();

      ctx.beginPath();

      ctx.lineWidth = 0.3;
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#FBF7F7';

      ctx.moveTo(diffInPx + _x, valueInPx);
      ctx.lineTo(WIDTH, valueInPx);

      ctx.stroke();
    };

    this.openOrder = function(order, index) {
      this.bets.push(order);

      if (order.type === 'sell') {
        sellBetIcon.style.opacity = 1;

        sellBetIcon.querySelector('span').innerHTML = 'TRADE ' + index;
      }

      if (order.type === 'buy') {
        buyBetIcon.style.opacity = 1;

        buyBetIcon.querySelector('span').innerHTML = 'TRADE ' + index;
      }

      didUpdate = true;
    };

    this.closeOrder = function(orderId, type) {
      this.bets = this.bets.filter((item) => item._id !== orderId);

      if (type == 'sell') {
        sellBetIcon.style.opacity = 0;
      }

      if (type == 'buy') {
        buyBetIcon.style.opacity = 0;
      }
    };

    this.drawBets = function() {
      this.bets.forEach((item) => {
        const __x = closestNumber(xAxis.labels, item.openTime) + 7500;

        let background;

        var yOpenInPx = timeStampToPX(
          item.openPrice.toFixed(2),
          this.scale,
          this.offset
        );

        var _xOpen = timeStampToPX(
          __x,
          xAxis.currentDiffScale,
          xAxis.currentDiffOffset
        );

        var _xClose = timeStampToPX(
          __x + 60000,
          xAxis.currentDiffScale,
          xAxis.currentDiffOffset
        );

        if (item.type === 'buy') {
          buyBetIcon.style.top = (yOpenInPx - 12 * dpx) / dpx + 'px';
          buyBetIcon.style.transform = `translateX(${(_xOpen -
            84 * dpx -
            30 * dpx) /
            dpx}px)`;
          background = '#2fdf03';
        }

        if (item.type === 'sell') {
          sellBetIcon.style.top = (yOpenInPx - 12 * dpx) / dpx + 'px';
          sellBetIcon.style.transform = `translateX(${(_xOpen -
            84 * dpx -
            30 * dpx) /
            dpx}px)`;
          background = '#e91e63';
        }

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#E28800';

        ctx.moveTo(_xOpen, yOpenInPx);
        ctx.lineTo(_xClose, yOpenInPx);

        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.globalAlpha = 1;
        ctx.fillStyle = background;

        ctx.arc(_xOpen, yOpenInPx, 4 * dpx, 0, 2 * Math.PI, false);

        ctx.fill();
        ctx.stroke();

        ctx.beginPath();

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#E28800';
        ctx.globalAlpha = 1;
        ctx.fillStyle = background;

        ctx.arc(_xClose, yOpenInPx, 4 * dpx, 0, 2 * Math.PI, false);

        ctx.fill();
        ctx.stroke();
      });
    };

    this.animate = function(item) {
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
    };

    this.drawLine = function(index, y) {
      ctx.lineWidth = 1;
      ctx.globalAlpha = 1;

      ctx.strokeStyle = colorScheme.linesColor;

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WIDTH, y);
      ctx.stroke();
    };

    this.formatNumber = function(n, short) {
      var abs = Math.abs(n);
      if (abs > 1000000000 && short) return (n / 1000000000).toFixed(2) + 'B';
      if (abs > 1000000 && short) return (n / 1000000).toFixed(2) + 'M';
      if (abs > 1000 && short) return n;

      if (abs > 1) {
        var s = abs.toFixed(0);
        var formatted = n < 0 ? '-' : '';
        for (var i = 0; i < s.length; i++) {
          formatted += s.charAt(i);
          if ((s.length - 1 - i) % 3 === 0) formatted += ' ';
        }
        return formatted;
      }

      return n.toString();
    };
  }

  function AxisX() {
    this.labels = [];
    this.fontColor = '#8E8E93';
    this.opacity = 0;
    this.beforeCount = 0;

    this.leftAbsoluteTsLimit = 1;
    this.rightAbsoluteTsLimit = Infinity;
    this.tsAbsoluteDifference = Infinity;
    this.stepTsDiff = 1;
    this.scaleRatio = 1;
    this.offset = 1;

    this.plusCount = 0;

    this.currentLeftPositionPx = 1;
    this.currentRightPositionPx = Infinity;

    this.currentDiff = 1;
    this.currentDiffScale = 1;
    this.currentDiffOffset = 1;
    this.currentDiffLeftPositionIndex = 1;
    this.currentDiffRightPositionIndex = Infinity;

    this.hovered = null;
    this.hoveredInPX = null;
    this.hoveredY = null;

    this.calculateCurrentScale = function(leftInPx, rightInPx) {
      const left = Math.ceil(pxToTs(leftInPx, this.scaleRatio, this.offset)),
        right = Math.floor(pxToTs(rightInPx, this.scaleRatio, this.offset)),
        currentDiff = right - left,
        currentScale = WIDTH / (currentDiff + this.stepTsDiff),
        currentOffset = -left * currentScale;

      return { left, right, currentDiff, currentScale, currentOffset };
    };

    this.setCurrentDiff = function(
      left,
      right,
      withRescale,
      withNewValue = false
    ) {
      const values = this.calculateCurrentScale(left, right);

      this.currentDiff = values.currentDiff;

      this.currentDiffScale = values.currentScale;

      this.currentDiffOffset = values.currentOffset;

      this.currentDiffLeftPositionIndex = Math.floor(
        (values.left - this.leftAbsoluteTsLimit) / this.stepTsDiff
      );

      this.currentDiffRightPositionIndex =
        Math.floor(
          (values.right - this.leftAbsoluteTsLimit) / this.stepTsDiff
        ) + 1;

      let emptyDots = 3.5;
      if (WIDTH / dpx <= 600) {
        emptyDots = 2.5;
      }

      if (withRescale) {
        const yeah = Math.floor(
          (this.currentDiffRightPositionIndex -
            this.currentDiffLeftPositionIndex) /
            emptyDots
        );

        this.setDifference(null, yeah, withNewValue);
      }
    };

    this.onDrag = function(newLeftPositionInPx) {
      var currentRange =
        this.currentRightPositionPx - this.currentLeftPositionPx;

      if (newLeftPositionInPx <= 0) {
        this.currentLeftPositionPx = 0;
        this.currentRightPositionPx = currentRange;
      } else if (newLeftPositionInPx + currentRange >= WIDTH) {
        this.currentLeftPositionPx = WIDTH - currentRange;
        this.currentRightPositionPx = WIDTH;
      } else {
        this.currentLeftPositionPx = newLeftPositionInPx;
        this.currentRightPositionPx = newLeftPositionInPx + currentRange;
      }

      this.setCurrentDiff(
        this.currentLeftPositionPx,
        this.currentRightPositionPx
      );
    };

    this.zoomCenter = function(__delta) {
      let delta = 0;

      if (__delta > 0) {
        delta = -1;
      }

      if (__delta < 0) {
        delta = 1;
      }

      const leftValueInPx = this.currentLeftPositionPx + delta,
        rightValueInPx = this.currentRightPositionPx - delta;

      const values = this.calculateCurrentScale(leftValueInPx, rightValueInPx);

      if (values.currentDiff < 15000 * 4 * 7) {
        return;
      }

      if (values.currentDiff > 15000 * 4 * 20) {
        return;
      }

      this.currentLeftPositionPx = leftValueInPx;
      this.currentRightPositionPx = rightValueInPx;

      if (this.currentRightPositionPx >= WIDTH) {
        this.currentRightPositionPx = WIDTH;
      }

      if (this.currentLeftPositionPx <= 0) {
        this.currentLeftPositionPx = 0;
      }

      this.setCurrentDiff(
        this.currentLeftPositionPx,
        this.currentRightPositionPx,
        true
      );
    };

    this.setCurrentPositionsWithTs = function(left, right) {
      var __left = timeStampToPX(left, this.scaleRatio, this.offset);
      var __right = timeStampToPX(right, this.scaleRatio, this.offset);

      this.currentLeftPositionPx = __left;

      this.currentRightPositionPx = __right;

      return { left: __left, right: __right };
    };

    this.setScaleRatio = function() {
      this.scaleRatio = WIDTH / this.tsAbsoluteDifference;

      this.setOffset();
    };

    this.setOffset = function() {
      this.offset = -this.leftAbsoluteTsLimit * this.scaleRatio;
    };

    this.resize = function() {
      this.setDifference(this.labels);
      this.setCurrentDiff(
        this.currentLeftPositionPx,
        this.currentRightPositionPx,
        true
      );
    };

    this.setInitialPosition = function() {
      const currentPosition = this.setCurrentPositionsWithTs(
        this.rightAbsoluteTsLimit - 15000 * 40,
        this.rightAbsoluteTsLimit
      );

      this.setCurrentDiff(currentPosition.left, currentPosition.right, true);
    };

    this.setDifference = function(labels, plusCount = 0) {
      labels = labels || this.labels;

      if (plusCount === Infinity) {
        plusCount = 0;
      }

      let prevPlusCount = this.plusCount;

      this.plusCount = plusCount;

      this.labels = labels;

      let i = plusCount;

      this.labels.splice(
        this.labels.length - prevPlusCount,
        this.labels.length
      );

      while (i > 0) {
        this.labels.push(this.labels[this.labels.length - 1] + 15 * 1000);
        i--;
      }

      this.leftAbsoluteTsLimit = labels[0];
      this.stepTsDiff = labels[1] - labels[0];
      this.rightAbsoluteTsLimit = labels[labels.length - 1];
      this.tsAbsoluteDifference = labels[labels.length - 1] - labels[0];

      this.setScaleRatio();
    };

    this.setHovered = function(currentInPx, yInPX) {
      if (!currentInPx) {
        this.hovered = null;
        this.hoveredInPX = null;
        this.hoveredY = null;
        didUpdate = true;

        return;
      }

      this.hoveredInPX = currentInPx;
      this.hovered = Math.floor(
        pxToTs(currentInPx * dpx, this.currentDiffScale, this.currentDiffOffset)
      );
      this.hoveredY = yInPX * dpx;
      didUpdate = true;
    };

    this.renderHoveredItem = () => {
      if (this.hovered) {
        const __x = closestNumber(this.labels, this.hovered) + 7500;
        var valueInPx = timeStampToPX(
          __x,
          this.currentDiffScale,
          this.currentDiffOffset
        );
        ctx.beginPath();

        ctx.strokeStyle = '#eee';
        ctx.globalAlpha = 0.2;
        ctx.lineWidth = 1 * dpx;
        ctx.moveTo(valueInPx, 0);
        ctx.lineTo(valueInPx, chartHeight);

        ctx.stroke();

        ctx.beginPath();

        ctx.strokeStyle = '#eee';
        ctx.globalAlpha = 0.2;
        ctx.lineWidth = 1 * dpx;
        ctx.moveTo(0, this.hoveredY);
        ctx.lineTo(WIDTH, this.hoveredY);

        ctx.stroke();
      }
    };

    this.renderStartEndText = () => {
      const __x = this.labels[this.labels.length - 1 - this.plusCount] + 7500;

      var _xClose = timeStampToPX(
        __x + 60000,
        this.currentDiffScale,
        this.currentDiffOffset
      );

      var xLeft = timeStampToPX(
        __x + 7500,
        this.currentDiffScale,
        this.currentDiffOffset
      );


      ctx.fillStyle = '#fff'

      ctx.fillText('Trade ', xLeft, chartHeight * 0.1);

      ctx.fillText('start', xLeft, chartHeight * 0.1 + 14 * dpx);

      ctx.fillText('Trade', _xClose + 10 * dpx, chartHeight * 0.1);

      ctx.fillText('end', _xClose + 10 * dpx, chartHeight * 0.1 + 14 * dpx);
    };

    this.renderStartEndBet = () => {
      const __x = this.labels[this.labels.length - 1 - this.plusCount] + 7500;

      var _xOpen = timeStampToPX(
        __x,
        this.currentDiffScale,
        this.currentDiffOffset
      );

      var _xClose = timeStampToPX(
        __x + 60000,
        this.currentDiffScale,
        this.currentDiffOffset
      );

      ctx.beginPath();

      ctx.save();

      ctx.setLineDash([5, 5]);

      ctx.strokeStyle = '#eee';
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 1 * dpx;
      ctx.moveTo(_xOpen, 0);
      ctx.lineTo(_xOpen, chartHeight);

      ctx.stroke();

      ctx.restore();

      ctx.beginPath();

      ctx.strokeStyle = '#eee';
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 1 * dpx;
      ctx.moveTo(_xClose, 0);
      ctx.lineTo(_xClose, chartHeight);

      ctx.stroke();
    };

    this.getCurrentStep = function() {
      let textStep = 1;

      if (this.currentDiff <= this.stepTsDiff * 30) {
        return 1;
      }
      if (this.stepTsDiff * 30 >= this.currentDiff) {
        textStep = 2;
      } else if (this.stepTsDiff * 100 >= this.currentDiff) {
        textStep = 5;
      } else if (this.stepTsDiff * 180 >= this.currentDiff) {
        textStep = 15;
      } else if (
        this.currentDiff >= this.stepTsDiff * 250 ||
        this.stepTsDiff * 250 >= this.currentDiff
      ) {
        textStep = 30;
      } else {
        textStep = 1;
      }

      return textStep;
    };

    this.render = function() {
      const textStep = this.getCurrentStep();

      const firstItem = this.labels
        .slice()
        .reverse()
        .findIndex((item) => {
          const dateItem = new Date(item).getMinutes();
          const dateSecond = new Date(item).getSeconds();
          return dateItem % textStep === 0 && dateSecond === 0;
        });

      for (
        var i = this.labels.length - firstItem - 1;
        i >= 0;
        i -= textStep * 4
      ) {
        var item = this.labels[i];

        var leftOffset = timeStampToPX(
          item + 7500,
          this.currentDiffScale,
          this.currentDiffOffset
        );

        if(i < this.currentDiffLeftPositionIndex || i > this.currentDiffRightPositionIndex){
          continue
        }

        ctx.beginPath();

        ctx.strokeStyle = '#eee';
        ctx.globalAlpha = 0.1;
        ctx.lineWidth = 1 * dpx;
        ctx.moveTo(leftOffset, 0);
        ctx.lineTo(leftOffset, chartHeight);

        ctx.stroke();

        ctx.fillStyle = colorScheme.xTextColor;
        ctx.globalAlpha = colorScheme.xTextAlpha;

        ctx.fillText(
          formatDate(this.labels[i], 'xLegend'),
          leftOffset - 10 * dpx,
          chartHeight + X_TEXT_PT + 10
        );
      }
    };

    var SHORT_MN = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    var FULL_MN = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    var DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    function formatDate(time, type) {
      var date = new Date(time);
      var month = '';

      if (type === 'topline') month = FULL_MN[date.getMonth()];
      else month = SHORT_MN[date.getMonth()];

      var minutes = date.getMinutes();

      if (minutes < 10) {
        minutes = '0' + minutes;
      }

      var s = date.getHours() + ':' + minutes;

      if (type === 'topline') {
        s = date.getDate() + ' ' + month + ' ' + date.getFullYear();
      } else if (type === 'xLegend') {
        s = s;
      } else if (type === 'modal') {
        s = DAY_NAMES[date.getDay()] + ', ' + s;
      }

      return s;
    }
  }

  function timeStampToPX(ts, scale, offset) {
    return ts * scale + offset;
  }

  function pxToTs(px, scale, offset) {
    return (px - offset) / scale;
  }
}
