import React, { memo, useState, useEffect, useRef } from 'react';
import Slider from 'react-slick';
import cn from 'classnames';
import Icon from '../../quarks/icon/icon';
import useWindowSize from '../../../hooks/windowSize';
import ContentViewer from '@components/atoms/contentViewer/contentViewer';
import Line from './line';
import './roadmap.scss';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

let __line = null;

export const Roadmap = memo(({ content }) => {
  const size = useWindowSize();

  const [currentItem, __setCurrentItem] = React.useState(1);

  const [pointerState, setPointerState] = useState('NONE');
  const [lineBounds, setLineBounds] = useState({ left: 0, right: 0, width: 0 });
  const [pointerPosition, setPointerPosition] = useState(0);

  const { items } = content;

  const lineWrapper = useRef(null);
  const canvasWrap = useRef(null);

  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 500,
    initialSlide: 1,
    swipeToSlide: true,
    slidesToShow: 5,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: 0,
    focusOnSelect: true,
    variableWidth: false,
    responsive: [
      {
        breakpoint: 820,
        settings: {
          slidesToShow: 3,
          variableWidth: true,
        },
      },
      {
        breakpoint: 400,
        settings: {
          slidesToShow: 1,
          variableWidth: true,
        },
      },
      {
        breakpoint: 350,
        settings: {
          slidesToShow: 1,
          variableWidth: true,
        },
      },
    ],
  };

  const setCurrentItem = (index) => {
    let __index = (index + 1) * 11 - 6;

    const elementWidth = lineBounds.width / 77;
    const leftPadding = elementWidth / 2

    setPointerPosition(__index * elementWidth + leftPadding - 10);
    __setCurrentItem(index);
  };

  const pointerDown = (e) => {
    const {
      left,
      right,
      width,
    } = e.target.parentElement.getBoundingClientRect();
    setLineBounds({ left, right, width });
    setPointerState('DRAG');
  };

  const pointerUp = () => {
    setPointerState('NONE');

    let __index = (currentItem + 1) * 11 - 6;

    const elementWidth = lineBounds.width / 77;
    const leftPadding = elementWidth / 2

    setPointerPosition(__index * elementWidth + leftPadding - 10);
  };

  const pointeerMove = (e) => {
    let position = e.clientX;

    position = position - lineBounds.left;

    if (position <= 0) {
      position = 0;
    }
    if (position >= lineBounds.width) {
      position = lineBounds.width;
    }

    let i = 1;
    let currentSlide = 0;

    while (i < 7) {
      if (
        position >= (lineBounds.width / 7) * i &&
        position <= (lineBounds.width / 7) * (i + 1)
      ) {
        currentSlide = i;
      }
      i++;
    }

    const elementWidth = lineBounds.width / 77;
    const leftPadding = (elementWidth - 1) / 2

    __setCurrentItem(currentSlide);
    setPointerPosition(position);
  };

  useEffect(() => {
    if (__line) {
      __line.setCursorPointer(pointerPosition);
    }
  }, [pointerPosition]);

  useEffect(() => {
    if (canvasWrap.current) {
      let sticksCount = 77;

      if (size.width <= 1080) {
        sticksCount = 55;
      }

      if (size.width <= 600) {
        sticksCount = 33;
      }

      if (size.width <= 350) {
        sticksCount = 11;
      }


      __line = new Line(sticksCount);
    }
  }, [canvasWrap]);

  useEffect(() => {
    if (canvasWrap.current) {
      
      let sticksCount = 77;

      if (size.width <= 1080) {
        sticksCount = 55;
      }

      if (size.width <= 600) {
        sticksCount = 33;
      }

      if (size.width <= 350) {
        sticksCount = 21;
      }

      __line.reInit(sticksCount)
      __line.setCursorPointer(pointerPosition);
    }

    const { left, right, width } = lineWrapper.current.getBoundingClientRect();

    setLineBounds({ left, right, width });

    let __index = (currentItem + 1) * 11 - 6;

    const elementWidth = width / 77;
    const leftPadding = elementWidth / 2

    if (size.width > 1200) {
      setPointerPosition(__index * elementWidth + leftPadding - 10);
    } else {
      setPointerPosition(window.innerWidth / 2 - 10);
    }
  }, [size.width])

  useEffect(() => {
    if (pointerState === 'DRAG') {
      document.addEventListener('mouseup', pointerUp);
      document.addEventListener('mousemove', pointeerMove);
      return () => {
        document.removeEventListener('mouseup', pointerUp);
        document.removeEventListener('mousemove', pointeerMove);
      };
    }
  }, [pointerState, currentItem]);

  const __list = items.map((item, idx) => {
    return (
      <div
        className={cn('roadmap-item', {
          'active-item': currentItem === idx,
        })}
        key={idx}
        onClick={() => {
          setCurrentItem(idx);
        }}>
        <div className='info'>
          <Icon variant={item.icon} />
          <p>{item.text}</p>
        </div>
        <ContentViewer content={item.date} />
      </div>
    );
  });

  return (
    <div className='roadmap'>
      <div className='roadmap-items-wrapper'>
        {size.width > 1200 ? (
          __list
        ) : (
          <Slider {...settings}>
            {items.map((item, idx) => (
              <div className={'roadmap-item'} key={idx + item.text}>
                <div className='info'>
                  <Icon variant={item.icon} />
                  <p>{item.text}</p>
                </div>

                <ContentViewer content={item.date} />
              </div>
            ))}
          </Slider>
        )}
      </div>
      <div ref={lineWrapper} className='roadmap-line-wrapper'>
        <div ref={canvasWrap} className='lineslider' />
        <div
          style={{ left: pointerPosition + 'px' }}
          className={cn('roadmap-pointer--wrapper', {
            dragged: pointerState === 'DRAG',
          })}
          onMouseDown={(e) => pointerDown(e)}>
          <Icon variant='roadmap-pointer' className='pointer' />
        </div>
      </div>
    </div>
  );
});

export default Roadmap;
